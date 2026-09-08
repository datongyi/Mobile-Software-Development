export type AngleMode = 'DEG' | 'RAD' | 'GRAD';

class CalculatorEngine {
  private lastLeft: number = 0;
  private lastRight: number = 0;
  private lastOperator: string = '';

  evaluate(expression: string, angleMode: AngleMode = 'DEG'): string {
    const source = expression.replace(/,/g, '').replace(/π/g, 'pi').replace(/√/g, 'sqrt');
    if (source.trim().length === 0) {
      return 'Error';
    }
    try {
      const tokens = this.tokenize(source);
      const value = this.parse(tokens, angleMode);
      if (!Number.isFinite(value)) {
        return 'Error';
      }
      this.captureRepeat(source);
      return this.format(value);
    } catch (error) {
      return 'Error';
    }
  }

  repeatLast(current: string, angleMode: AngleMode = 'DEG'): string {
    if (this.lastOperator.length === 0) {
      return this.evaluate(current, angleMode);
    }
    const left = Number(current.replace(/,/g, ''));
    if (!Number.isFinite(left)) {
      return 'Error';
    }
    const value = this.apply(left, this.lastRight, this.lastOperator);
    return Number.isFinite(value) ? this.format(value) : 'Error';
  }

  convertUnit(value: number, category: string, from: string, to: string): string {
    if (!Number.isFinite(value)) {
      return 'Error';
    }
    let result = value;
    if (category === 'temperature') {
      const celsius = from === 'C' ? value : (from === 'F' ? (value - 32) * 5 / 9 : value - 273.15);
      result = to === 'C' ? celsius : (to === 'F' ? celsius * 9 / 5 + 32 : celsius + 273.15);
    } else {
      const fromFactor = this.unitFactor(from);
      const toFactor = this.unitFactor(to);
      if (fromFactor < 0 || toFactor < 0) {
        return 'Error';
      }
      result = value * fromFactor / toFactor;
    }
    return this.format(result);
  }

  private tokenize(source: string): string[] {
    const tokens: string[] = [];
    let current = '';
    for (let i = 0; i < source.length; i++) {
      const char = source.charAt(i);
      if ((char >= '0' && char <= '9') || char === '.') {
        current += char;
      } else {
        if (current.length > 0) { tokens.push(current); current = ''; }
        if (char === ' ' || char === '\t') { continue; }
        if ('+-*/^()%!'.indexOf(char) >= 0) { tokens.push(char); continue; }
        if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
          let name = char;
          while (i + 1 < source.length && /[a-zA-Z]/.test(source.charAt(i + 1))) { i++; name += source.charAt(i); }
          tokens.push(name.toLowerCase());
          continue;
        }
        throw new Error('invalid token');
      }
    }
    if (current.length > 0) { tokens.push(current); }
    return tokens;
  }

  private parse(tokens: string[], angleMode: AngleMode): number {
    let index = 0;
    const peek = (): string => tokens[index] || '';
    const take = (): string => tokens[index++] || '';
    const primary = (): number => {
      const token = take();
      if (token === '(') {
        const value = additive();
        if (take() !== ')') { throw new Error('parenthesis'); }
        return value;
      }
      if (token === '-') { return -primary(); }
      if (token === '+') { return primary(); }
      if (token === 'pi') { return Math.PI; }
      if (token === 'e') { return Math.E; }
      if (token === 'sqrt' || token === 'sin' || token === 'cos' || token === 'tan' || token === 'asin' || token === 'acos' || token === 'atan' || token === 'sinh' || token === 'cosh' || token === 'tanh' || token === 'asinh' || token === 'acosh' || token === 'atanh' || token === 'log' || token === 'ln' || token === 'abs' || token === 'root' || token === 'pow10' || token === 'exp') {
        let value: number;
        if (peek() === '(') { take(); value = additive(); if (take() !== ')') { throw new Error('parenthesis'); } }
        else { value = primary(); }
        return this.functionValue(token, value, angleMode);
      }
      if (token === '!') {
        const factorialValue = primary();
        if (factorialValue < 0 || factorialValue > 170 || Math.floor(factorialValue) !== factorialValue) { throw new Error('factorial'); }
        let factorial = 1;
        for (let i = 2; i <= factorialValue; i++) { factorial *= i; }
        return factorial;
      }
      const number = Number(token);
      if (!Number.isFinite(number)) { throw new Error('number'); }
      if (peek() === '%') { take(); return number / 100; }
      if (peek() === '!') {
        take();
        if (number < 0 || number > 170 || Math.floor(number) !== number) { throw new Error('factorial'); }
        let factorial = 1;
        for (let i = 2; i <= number; i++) { factorial *= i; }
        return factorial;
      }
      return number;
    };
    const power = (): number => {
      const left = primary();
      if (peek() === '^') { take(); return Math.pow(left, power()); }
      return left;
    };
    const multiplicative = (): number => {
      let value = power();
      while (peek() === '*' || peek() === '/') {
        const op = take(); const right = power(); value = this.apply(value, right, op);
      }
      return value;
    };
    const additive = (): number => {
      let value = multiplicative();
      while (peek() === '+' || peek() === '-') {
        const op = take(); const right = multiplicative(); value = this.apply(value, right, op);
      }
      return value;
    };
    const result = additive();
    if (index !== tokens.length) { throw new Error('trailing'); }
    return result;
  }

  private functionValue(name: string, value: number, angleMode: AngleMode): number {
    const radians = angleMode === 'DEG' ? value * Math.PI / 180 : (angleMode === 'GRAD' ? value * Math.PI / 200 : value);
    switch (name) {
      case 'sqrt': return Math.sqrt(value);
      case 'sin': return Math.sin(radians);
      case 'cos': return Math.cos(radians);
      case 'tan': return Math.tan(radians);
      case 'asin': return Math.asin(value) * 180 / Math.PI;
      case 'acos': return Math.acos(value) * 180 / Math.PI;
      case 'atan': return Math.atan(value) * 180 / Math.PI;
      case 'sinh': return Math.sinh(radians);
      case 'cosh': return Math.cosh(radians);
      case 'tanh': return Math.tanh(radians);
      case 'asinh': return Math.asinh(value);
      case 'acosh': return Math.acosh(value);
      case 'atanh': return Math.atanh(value);
      case 'log': return Math.log10(value);
      case 'ln': return Math.log(value);
      case 'abs': return Math.abs(value);
      case 'pow10': return Math.pow(10, value);
      case 'exp': return Math.exp(value);
      case 'root': return Math.sqrt(value);
      default: return NaN;
    }
  }

  private apply(left: number, right: number, operator: string): number {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right === 0 ? NaN : left / right;
      default: return NaN;
    }
  }

  private captureRepeat(source: string): void {
    const match = /^\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*([+\-*/])\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*$/.exec(source);
    if (match) {
      this.lastLeft = Number(match[1]); this.lastOperator = match[2]; this.lastRight = Number(match[3]);
    } else {
      this.lastOperator = '';
    }
  }

  private format(value: number): string {
    if (Math.abs(value) < 1e-12) { return '0'; }
    return Number(value.toPrecision(12)).toString();
  }

  private unitFactor(unit: string): number {
    switch (unit) {
      case 'mm': return 0.001; case 'cm': return 0.01; case 'm': return 1; case 'km': return 1000; case 'in': return 0.0254; case 'ft': return 0.3048; case 'mi': return 1609.344;
      case 'm2': return 1; case 'km2': return 1000000; case 'ha': return 10000; case 'ft2': return 0.09290304;
      case 'mg': return 0.000001; case 'g': return 0.001; case 'kg': return 1; case 't': return 1000; case 'lb': return 0.45359237;
      case 's': return 1; case 'min': return 60; case 'h': return 3600; case 'day': return 86400;
      case 'ms': return 1; case 'kph': return 0.2777777778; case 'mph': return 0.44704;
      case 'B': return 1; case 'KB': return 1024; case 'MB': return 1048576; case 'GB': return 1073741824; case 'TB': return 1099511627776;
      default: return -1;
    }
  }
}

export default new CalculatorEngine();
