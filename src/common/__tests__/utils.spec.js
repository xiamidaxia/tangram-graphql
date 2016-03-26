import { expect } from 'chai';
import { replaceObj, mapValues, getGrapQLArgsStr } from '../utils';
describe('Utils', () => {
  it('mapValues', () => {
    const oldObj = { name: 'name', value: 'value' };
    const paramObj = {};
    const newObj = mapValues(oldObj, (val) => {
      return '_' + val;
    }, paramObj);
    expect(newObj).eql(paramObj);
    expect(newObj).to.eql({
      name: '_name',
      value: '_value',
    });
  });
  it('replaceObj', () => {
    const oldObj = { name: 'name', value: 'value', keyNoChange: 'keyNoChange', keyFn: 'keyFn', otherVal: 'otherVal' };
    const newObj = replaceObj(oldObj, {
      name: '_name',
      value: {
        key: '_value',
        fn: () => 'newValue',
      },
      keyNoChange: {
        fn: () => 'newKeyNoChange',
      },
      keyFn() {
        return 'newFn';
      },
    });
    expect(newObj).to.eql({
      _name: 'name',
      _value: 'newValue',
      keyNoChange: 'newKeyNoChange',
      keyFn: 'newFn',
      otherVal: 'otherVal',
    });
  });
  it('getGrapQLArgsStr', () => {
    function check(val, expected) {
      expect(getGrapQLArgsStr(val)).to.eql(expected);
    }
    const obj = { str: 'str', num: 33, arr: ['arr1', 'arr2', 3] };
    const objStr = '{str:"str",num:33,arr:["arr1","arr2",3]}';
    check(3, '3');
    check('str', '"str"');
    check({}, '{}');
    check([], '[]');
    check(obj, objStr);
    check([obj, obj], `[${objStr},${objStr}]`);
  });
});
