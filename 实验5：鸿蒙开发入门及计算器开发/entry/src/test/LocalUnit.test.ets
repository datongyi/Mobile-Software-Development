import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import CalculatorEngine from '../main/ets/common/CalculatorEngine';

export default function localUnitTest() {
  describe('localUnitTest', () => {
    // Defines a test suite. Two parameters are supported: test suite name and test suite function.
    beforeAll(() => {
      // Presets an action, which is performed only once before all test cases of the test suite start.
      // This API supports only one parameter: preset action function.
    });
    beforeEach(() => {
      // Presets an action, which is performed before each unit test case starts.
      // The number of execution times is the same as the number of test cases defined by **it**.
      // This API supports only one parameter: preset action function.
    });
    afterEach(() => {
      // Presets a clear action, which is performed after each unit test case ends.
      // The number of execution times is the same as the number of test cases defined by **it**.
      // This API supports only one parameter: clear action function.
    });
    afterAll(() => {
      // Presets a clear action, which is performed after all test cases of the test suite end.
      // This API supports only one parameter: clear action function.
    });
    it('assertContain', 0, () => {
      // Defines a test case. This API supports three parameters: test case name, filter parameter, and test case function.
      let a = 'abc';
      let b = 'b';
      // Defines a variety of assertion methods, which are used to declare expected boolean conditions.
      expect(a).assertContain(b);
      expect(a).assertEqual(a);
    });

    it('evaluates operator precedence', 0, () => {
      expect(CalculatorEngine.evaluate('2 + 3 * 4')).assertEqual('14');
    });

    it('repeats the last binary operation', 0, () => {
      expect(CalculatorEngine.evaluate('8 + 2')).assertEqual('10');
      expect(CalculatorEngine.repeatLast('10')).assertEqual('12');
      expect(CalculatorEngine.repeatLast('12')).assertEqual('14');
    });

    it('evaluates degree based scientific functions', 0, () => {
      expect(CalculatorEngine.evaluate('sin(90)', 'DEG')).assertEqual('1');
    });

    it('converts Celsius to Fahrenheit', 0, () => {
      expect(CalculatorEngine.convertUnit(100, 'temperature', 'C', 'F')).assertEqual('212');
    });

    it('returns an error for division by zero', 0, () => {
      expect(CalculatorEngine.evaluate('4 / 0')).assertEqual('Error');
    });
  });
}
