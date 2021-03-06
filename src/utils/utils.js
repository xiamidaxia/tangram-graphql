const toString = Object.prototype.toString;
/**
 * Applies a function to every key-value pair inside an object.
 *
 * @param {Object} obj The source object.
 * @param {Function} fn The mapper function that receives the value and the key.
 * @param {Object?} res - Result object
 * @returns {Object} A new object that contains the mapped values for the keys.
 */
export function mapValues(obj, fn, res = {}) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, res);
}
/**
 * @param {Object} obj
 * @param {Object} keyMap
 * @returns {Object}
 * @example
 *  const oldObj = {name: 'xiami', value: 'oldvalue', fn: 'fn'}
 *  const newObj = replaceObj(oldObj, {
 *    name: '_name',
 *    value: {
 *      key: '_value',
 *      fn: () => 'newValue',
 *    },
 *    fn() { return 'newFn'; },
 *  });
 *  expect(newObj).to.eql({
 *    _name: 'xiami',
 *    _value: 'newValue',
 *    fn: 'newFn',
 *  });
 */
export function replaceObj(obj, keyMap = {}) {
  const newObj = {};
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (keyMap[i]) {
        if (typeof keyMap[i] === 'function') {
          newObj[i] = keyMap[i](obj[i], obj);
        } else {
          const rep = typeof keyMap[i] === 'string' ? { key: keyMap[i] } : keyMap[i];
          newObj[rep.key || i] = rep.fn ? rep.fn(obj[i]) : obj[i];
        }
      } else {
        newObj[i] = obj[i];
      }
    }
  }
  return newObj;
}
export function autoBind(target, keys) {
  keys.forEach((key) => {
    target[key] = target[key].bind(target);
  });
}
/**
 * @param {*} value
 * @return {String}
 */
export function getGrapQLArgsStr(value) {
  function parse(val) {
    if (typeof val === 'string') {
      return `"${val.replace(/"/g, '\\"')}"`;
    }
    if (typeof val === 'number') {
      return String(val);
    }
    if (Array.isArray(val)) {
      return '[' + val.map(item => parse(item)).join(',') + ']';
    }
    const res = [];
    mapValues(val, (item, key) => {
      res.push(`${key}:${parse(item)}`);
    });
    return '{' + res.join(',') + '}';
  }
  return parse(value);
}

export const isFunction = arg => toString.call(arg) === '[object Function]';

export function hooksMerge(hooks1 = {}, hooks2 = {}) {
  return {
    pre: [...hooks1.pre || [], ...hooks2.pre || []],
    after: [...hooks1.after || [], ...hooks2.after || []],
  };
}
export function idFixed(obj) {
  if (obj && obj.id) {
    obj.id = obj._id;
  }
  return obj;
}

export function getValByKeys(obj, keys = []) {
  return keys.reduce((obj, key) => {
    if (obj === null || obj === undefined) return null;
    return obj[key];
  }, obj);
}
