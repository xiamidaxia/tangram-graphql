import { expect } from 'chai';
import { replaceObj, mapValues } from '../utils';
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
      keyFn() { return 'newFn'; },
    });
    expect(newObj).to.eql({
      _name: 'name',
      _value: 'newValue',
      keyNoChange: 'newKeyNoChange',
      keyFn: 'newFn',
      otherVal: 'otherVal',
    });
  });
});
