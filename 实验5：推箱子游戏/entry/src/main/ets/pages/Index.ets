import CalculatorEngine, { AngleMode } from '../common/CalculatorEngine';
import { common } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';

type Mode = 'BASIC' | 'SCI' | 'CONVERT';

@Entry
@Component
struct Index {
  @State expression: string = '';
  @State result: string = '0';
  @State night: boolean = false;
  @State mode: Mode = 'BASIC';
  @State angleMode: AngleMode = 'DEG';
  @State memory: number = 0;
  @State history: string[] = [];
  @State notice: string = '';
  @State convertCategory: string = 'length';
  @State convertFrom: string = 'm';
  @State convertTo: string = 'km';
  @State convertInput: string = '1';
  @State convertResult: string = '0.001';
  @State justEvaluated: boolean = false;
  @State second: boolean = false;

  private basicKeys: string[] = ['C', '⌫', '±', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '%', '0', '.', '='];
  private scienceKeys: string[] = ['2nd', '1/x', 'x²', 'x³', 'xʸ', '10ˣ', 'sin(', 'cos(', 'tan(', 'sinh(', 'cosh(', 'tanh(', 'log(', 'ln(', 'eˣ', 'π', 'e', '(', ')', 'abs(', '!', 'Rand', 'EE'];
  private categories: string[] = ['length', 'area', 'mass', 'temperature', 'time', 'speed', 'data'];

  build() {
    Column() {
      if (this.mode === 'SCI') {
        Row() {
          this.modeButton('BASIC', 'Basic');
          Text('Scientific').fontSize(18).fontWeight(FontWeight.Bold).fontColor(this.night ? '#67e8f9' : '#b45309').layoutWeight(1).textAlign(TextAlign.Center);
          this.modeButton('CONVERT', 'Convert');
          Button(this.night ? 'Day' : 'Night').fontSize(12).height(34).backgroundColor(this.night ? '#67e8f9' : '#292524').fontColor(this.night ? '#111827' : '#fff').onClick(() => { this.night = !this.night; });
        }.height(44).width('100%').padding({ left: 16, right: 16, top: 4 });
      } else {
        Row() {
          Column() {
            Text('CALC // PERSONAL').fontSize(12).fontColor(this.night ? '#67e8f9' : '#b45309').letterSpacing(2);
            Text(this.mode === 'CONVERT' ? 'Unit Studio' : 'Science Desk').fontSize(24).fontWeight(FontWeight.Bold).fontColor(this.night ? '#f8fafc' : '#292524');
          }.alignItems(HorizontalAlign.Start).layoutWeight(1);
          Button(this.night ? '☀ Day' : '☾ Night').fontSize(13).fontColor(this.night ? '#111827' : '#fff').backgroundColor(this.night ? '#67e8f9' : '#292524').onClick(() => { this.night = !this.night; });
        }.width('100%').padding({ left: 20, right: 20, top: 16, bottom: 10 });
        Row() { this.modeButton('BASIC', 'Basic'); this.modeButton('SCI', 'Science'); this.modeButton('CONVERT', 'Convert'); }.width('100%').padding({ left: 16, right: 16, bottom: 12 });
      }
      if (this.mode === 'CONVERT') { this.converterView(); } else {
        Column() {
          Text(this.expression.length > 0 ? this.expression : '0').fontSize(34).fontColor(this.night ? '#f8fafc' : '#292524').textAlign(TextAlign.End).width('100%').maxLines(2);
          Row() { Text(this.result).fontSize(22).fontColor(this.night ? '#94a3b8' : '#78716c').layoutWeight(1).textAlign(TextAlign.End); Button('Copy').fontSize(11).backgroundColor(this.night ? '#1e293b' : '#e7ded0').fontColor(this.night ? '#67e8f9' : '#92400e').onClick(() => { this.notice = 'Result copied'; }); }.width('100%').margin({ top: 8 });
        }.height(this.mode === 'SCI' ? 62 : 190).padding({ left: 20, right: 20, top: 2, bottom: 2 });
        if (this.mode !== 'SCI') {
          Row() { this.smallButton('MC', () => { this.memory = 0; }); this.smallButton('MR', () => { this.append(String(this.memory)); }); this.smallButton('M+', () => { this.memory += Number(this.result); }); this.smallButton('M-', () => { this.memory -= Number(this.result); }); this.smallButton(this.angleMode, () => { this.angleMode = this.angleMode === 'DEG' ? 'RAD' : (this.angleMode === 'RAD' ? 'GRAD' : 'DEG'); }); }.padding({ left: 16, right: 16, bottom: 8 }).width('100%');
        }
        if (this.mode === 'SCI') {
          Row() {
            Grid() {
              ForEach(this.scienceKeys, (key: string) => {
                GridItem() { this.keyButton(key, true); }
              });
            }.columnsTemplate('1fr 1fr 1fr 1fr').rowsGap(8).columnsGap(8).width('50%').padding({ left: 16, right: 8, bottom: 14 });
            Grid() {
              ForEach(this.basicKeys, (key: string) => {
                GridItem() { this.keyButton(key, false); }
              });
            }.columnsTemplate('1fr 1fr 1fr 1fr').rowsGap(8).columnsGap(8).width('50%').padding({ left: 8, right: 16, bottom: 14 });
          }.width('100%').layoutWeight(1);
        } else {
          Grid() {
            ForEach(this.basicKeys, (key: string) => {
              GridItem() { this.keyButton(key, false); }
            });
          }.columnsTemplate('1fr 1fr 1fr 1fr').rowsGap(10).columnsGap(10).padding({ left: 16, right: 16, bottom: 14 }).layoutWeight(1);
        }
        if (this.mode !== 'SCI') {
          Row() { Button('History').fontSize(12).backgroundColor(this.night ? '#1e293b' : '#e7ded0').fontColor(this.night ? '#f8fafc' : '#292524').onClick(() => { this.notice = this.history.length > 0 ? this.history.join('  |  ') : 'No history'; }); Button('Clear history').fontSize(12).backgroundColor(this.night ? '#1e293b' : '#e7ded0').fontColor(this.night ? '#f8fafc' : '#292524').onClick(() => { this.history = []; this.notice = 'History cleared'; }); }.justifyContent(FlexAlign.SpaceBetween).width('100%').padding({ left: 16, right: 16, bottom: 10 });
        }
      }
      if (this.notice.length > 0) { Text(this.notice).fontSize(12).fontColor(this.night ? '#67e8f9' : '#b45309').margin({ bottom: 8 }); }
    }.width('100%').height('100%').backgroundColor(this.night ? '#111827' : '#f5f1e8');
  }

  @Builder modeButton(value: Mode, label: string) { Button(label).fontSize(13).layoutWeight(1).margin({ right: 6 }).backgroundColor(this.mode === value ? (this.night ? '#0e7490' : '#d97706') : (this.night ? '#1e293b' : '#e7ded0')).fontColor(this.mode === value ? '#fff' : (this.night ? '#cbd5e1' : '#292524')).onClick(() => { this.mode = value; this.setOrientation(value === 'SCI'); }); }
  @Builder smallButton(label: string, action: () => void) { Button(label).fontSize(11).layoutWeight(1).margin({ right: 4 }).backgroundColor(this.night ? '#1e293b' : '#fffaf0').fontColor(this.night ? '#67e8f9' : '#92400e').onClick(action); }
  @Builder keyButton(key: string, science: boolean, equals: boolean = false) {
    Button(this.scienceDisplay(key, science)).fontSize(this.mode === 'SCI' ? 12 : (key === '=' ? 24 : 20)).height(this.mode === 'SCI' ? 30 : 52).width('100%').backgroundColor(key === '=' ? (this.night ? '#0e7490' : '#d97706') : (this.night ? '#1e293b' : '#fffaf0')).fontColor(key === '=' ? '#fff' : (this.night ? '#f8fafc' : '#292524')).onClick(() => { this.press(this.scienceDisplay(key, science)); });
  }

  @Builder converterView() {
    Column() {
      Text('QUICK CONVERTER').fontSize(12).fontColor(this.night ? '#67e8f9' : '#b45309').letterSpacing(2);
      Grid() {
        ForEach(this.categories, (category: string) => {
          GridItem() {
            Button(this.categoryLabel(category)).fontSize(13).height(36).width('100%')
              .backgroundColor(this.convertCategory === category ? (this.night ? '#0e7490' : '#d97706') : (this.night ? '#1e293b' : '#fffaf0'))
              .fontColor(this.convertCategory === category ? '#fff' : (this.night ? '#f8fafc' : '#292524'))
              .onClick(() => { this.convertCategory = category; const units = this.categoryUnits(category); this.convertFrom = units[0]; this.convertTo = units[1]; this.updateConversion(); });
          }
        });
      }.columnsTemplate('1fr 1fr 1fr 1fr').rowsGap(6).columnsGap(6).width('100%').height(78).margin({ top: 18, bottom: 14 });
      TextInput({ text: this.convertInput, placeholder: 'value' }).fontSize(28).height(60).fontColor(this.night ? '#f8fafc' : '#292524').backgroundColor(this.night ? '#1e293b' : '#fffaf0').onChange((value: string) => { this.convertInput = value; this.updateConversion(); });
      Row() { this.unitButton(true); Text('→').fontSize(24).fontColor(this.night ? '#67e8f9' : '#b45309').margin({ left: 8, right: 8 }); this.unitButton(false); }.width('100%').margin({ top: 14 });
      Text(this.convertResult).fontSize(42).fontWeight(FontWeight.Bold).fontColor(this.night ? '#f8fafc' : '#292524').margin({ top: 28 });
      Text('Tap a unit to cycle through options').fontSize(12).fontColor(this.night ? '#94a3b8' : '#78716c').margin({ top: 8 });
      Button('Use result in calculator').fontSize(13).margin({ top: 26 }).backgroundColor(this.night ? '#0e7490' : '#d97706').fontColor('#fff').onClick(() => { this.mode = 'BASIC'; this.expression = this.convertResult; this.result = this.convertResult; });
    }.padding({ left: 20, right: 20, top: 12 });
  }
  @Builder unitButton(from: boolean) { Button(from ? this.convertFrom : this.convertTo).layoutWeight(1).fontSize(18).backgroundColor(this.night ? '#1e293b' : '#fffaf0').fontColor(this.night ? '#f8fafc' : '#292524').onClick(() => { const list = this.categoryUnits(this.convertCategory); const current = from ? this.convertFrom : this.convertTo; const index = list.indexOf(current); const next = list[(index + 1) % list.length]; if (from) { this.convertFrom = next; } else { this.convertTo = next; } this.updateConversion(); }); }

  private press(key: string): void {
    if (key === 'C') { this.expression = ''; this.result = '0'; this.justEvaluated = false; return; }
    if (key === '⌫') { this.expression = this.expression.slice(0, -1); this.justEvaluated = false; this.preview(); return; }
    if (key === '±') { const current = Number(this.result); if (Number.isFinite(current)) { this.expression = String(-current); this.result = this.expression; } return; }
    if (key === '=') {
      const previousExpression = this.expression;
      const value = this.justEvaluated ? CalculatorEngine.repeatLast(this.result, this.angleMode) : CalculatorEngine.evaluate(this.expression, this.angleMode);
      if (value !== 'Error') { this.history = [previousExpression + ' = ' + value, ...this.history].slice(0, 10); this.expression = value; this.justEvaluated = true; }
      this.result = value; return;
    }
    if (key === '2nd') { this.second = !this.second; }
    else if (key === '1/x') { const value = Number(this.result); this.expression = value === 0 ? '0' : String(1 / value); }
    else if (key === 'x²') { this.expression += '^2'; } else if (key === 'x³') { this.expression += '^3'; } else if (key === 'xʸ') { this.expression += '^'; }
    else if (key === '10ˣ') { this.expression += 'pow10('; } else if (key === 'eˣ') { this.expression += 'exp('; }
    else if (key === 'Rand') { this.expression += String(Math.random()); } else if (key === 'EE') { this.expression += 'e'; }
    else if (key === 'DEG' || key === 'RAD') { this.angleMode = key as AngleMode; } else { this.append(key); }
    this.justEvaluated = false;
    this.preview();
  }
  private append(value: string): void { const map: Record<string, string> = { '÷': '/', '×': '*' }; this.expression += map[value] || value; }
  private preview(): void { if (this.expression.length > 0) { this.result = CalculatorEngine.evaluate(this.expression, this.angleMode); } }
  private updateConversion(): void { this.convertResult = CalculatorEngine.convertUnit(Number(this.convertInput), this.convertCategory, this.convertFrom, this.convertTo); }
  private scienceDisplay(key: string, science: boolean): string {
    if (!science || !this.second) { return key; }
    switch (key) {
      case 'sin(': return 'asin('; case 'cos(': return 'acos('; case 'tan(': return 'atan('; case 'sinh(': return 'asinh('; case 'cosh(': return 'acosh('; case 'tanh(': return 'atanh('; default: return key;
    }
  }
  private setOrientation(landscape: boolean): void {
    try {
      const context = this.getUIContext().getHostContext() as common.UIAbilityContext;
      window.getLastWindow(context).then((mainWindow: window.Window) => {
        mainWindow.setPreferredOrientation(landscape ? window.Orientation.LANDSCAPE : window.Orientation.PORTRAIT);
      });
    } catch (error) {
      this.notice = 'Orientation unavailable';
    }
  }
  private categoryUnits(category: string): string[] {
    switch (category) {
      case 'length': return ['mm', 'cm', 'm', 'km', 'in', 'ft', 'mi']; case 'area': return ['m2', 'km2', 'ha', 'ft2']; case 'mass': return ['mg', 'g', 'kg', 't', 'lb'];
      case 'temperature': return ['C', 'F', 'K']; case 'time': return ['s', 'min', 'h', 'day']; case 'speed': return ['ms', 'kph', 'mph']; default: return ['B', 'KB', 'MB', 'GB', 'TB'];
    }
  }
  private categoryLabel(category: string): string {
    switch (category) {
      case 'length': return '长度';
      case 'area': return '面积';
      case 'mass': return '质量';
      case 'temperature': return '温度';
      case 'time': return '时间';
      case 'speed': return '速度';
      default: return '数据';
    }
  }
}
