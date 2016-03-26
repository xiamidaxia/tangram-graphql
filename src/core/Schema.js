import { VARIABLE_REG } from '../common/constants';
import { mapValues } from '../common/utils';
const SCHEMA_TYPES = ['Collection', 'Store'];
const baseType = ['String', 'Int', 'Float', 'Buffer', 'Boolean', 'Date'];
let _count = 0;
function normalizeName(name) {
  return name[0].toUpperCase() + name.slice(1);
}
/**
 * todo enum support
 * @class Schema
 */
export default class Schema {
  /**
   * check schema init data.
   * @param {Object} initData
   * @param {Object} refs
   */
  static checkVariable(initData, refs) {
    const INIT_KEYS = ['name!', 'type!', 'struct!', 'refs'];
    const initKeys = Object.keys(initData);
    // check refs
    Object.keys(refs).forEach((key) => {
      if (!(refs[key] instanceof Schema)) {
        throw new Error(`Schema refs ${key} must instance of Schema.`);
      }
    });
    INIT_KEYS.forEach((key) => {
      const required = key.slice(-1) === '!';
      const keyName = required ? key.slice(0, -1) : key;
      if (required && !initKeys.includes(keyName)) {
        throw new Error(`Schema need ${keyName}.`);
      }
      switch (keyName) {
        case 'name':
          if (!VARIABLE_REG.test(initData.name)) {
            throw new Error(`Schema name illegal: ${initData.name}.`);
          }
          break;
        case 'type':
          if (!SCHEMA_TYPES.includes(initData.type)) {
            throw new Error(`Unknown schema type: ${initData.type}.`);
          }
          break;
        case 'struct':
          mapValues(initData.struct, (obj) => {
            if (!obj.type) throw new Error('Schema struct need a type.');
            const type = obj.type.replace(/[!\[\]]/g, '');
            if (obj.name === 'id' || !VARIABLE_REG.test(obj.name)) {
              throw new Error(`Schema struct name illegal: ${obj.name}.`);
            }
            if (initData.name !== type && !baseType.includes(type) && !refs[type]) {
              throw new Error(`Schema refs ${type} is required.`);
            }
          });
          break;
        case 'refs':
          if (initData.refs) {
            initData.refs.forEach((dep) => {
              if (!Object.keys(refs).includes(dep)) {
                throw new Error(`Schema refs ${dep} is required.`);
              }
            });
          }
          break;
      }
    });
  }

  /**
   * @param {Object} initData
   * @param {Object} refs
   */
  constructor(initData = {}, refs = {}) {
    this.constructor.checkVariable(initData, refs);
    this.name = normalizeName(initData.name);
    this.id = _count ++;
    this.type = initData.type;
    this.refs = { ...refs, [this.name]: this };
    this.struct = this._normalizeStruct(initData.struct);
    this._fragments = initData.fragments;
    this._actions = initData.actions;
  }
  /**
   * @param {Object} struct
   * @returns {Object}
   * @private
   */
  _normalizeStruct(struct) {
    return mapValues(struct, (obj) => {
      let { type } = obj;
      const required = type.slice(-1) === '!';
      type = required ? type.slice(0, -1) : type;
      if (type.match(/^\[.+\]$/)) {
        return { ...obj, type: 'Array', required, ref: normalizeName(type.slice(1, -1)) };
      }
      return { ...obj, type, required };
    });
  }
  checkData(data) {
    if (data) {
      mapValues(this.struct, ({ required, max, min }, key) => {
        const val = data[key];
        if (!val && required) {
          throw new Error(`Schema ${this}.${key} must be required.`);
        }
        if (min && val.length < min) {
          throw new Error(`Schema ${this}.${key} length must more than ${min}.`);
        }
        if (max && val.length > max) {
          throw new Error(`Schema ${this}.${key} length must less than ${max}.`);
        }
      });
    }
  }
  getActionQL(name) {
    if (!this._actions[name]) {
      throw new Error(`Schema ${this} unknown action: ${name}`);
    }
    if (/[fF]ragment/.test(this._actions[name])) {
      return this._fragments + '\n' + this._actions[name];
    }
    return this._actions[name];
  }
  toString() {
    return this.name;
  }
}
