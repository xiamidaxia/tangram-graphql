import { autoBind, getValByKeys } from '../utils';
import { EventEmitter } from 'events';
import ClientTangram from './ClientTangram';
/**
 * @class Store
 */
export default class Store extends EventEmitter {
  constructor(storeKeys, opts = {}) {
    super();
    if (!opts.fetcher || !opts.schemas) {
      throw new Error('Store opts need "fetcher" and "schemas".');
    }
    this._storeKeys = storeKeys;
    this._opts = opts;
    this._cache = {};
    this._schemas = {};
    this._actionStates = {};
    autoBind(this, ['connect', 'dispatch']);
  }
  /**
   * @param {String|Array} keys - store keys
   * @param {function} cb
   */
  subscribe(keys, cb) {
    cb(this.getStore(keys), 'init');
    this.on('change', (key) => {
      cb(this.getStore(keys), key);
    });
  }
  connect() {
  }
  /**
   * @param {String|Array<String>} actions
   * @param {Object?|Array<Object>?} args
   * @param {Boolean} series
   * @returns {Promise|Array<Promise>}
   */
  dispatch(actions, args = [], series) {
    args = !Array.isArray(args) ? [args] : args;
    if (typeof actions === 'string') {
      return this.execAction(actions, args[0]);
    }
    if (!series) {
      return Promise.all(actions.map((action, index) => this.execAction(action, args[index])));
    }
    const res = [];
    let p = Promise.resolve();
    actions.forEach((action, index) => {
      p = p.then(() => {
        return this.execAction(action, args[index]);
      }).then((data) => {
        res.push(data);
      });
    });
    return p.then(() => res);
  }

  _updateActionState(action, state) {
    this._actionStates = { ...this._actionStates, [action]: state };
    this.emit('change');
  }
  _updateData(action, data) {
    this._cache[action] = data;
    this._actionStates = { ...this._actionStates, [action]: { success: true } };
    this.emit('change');
  }
  /**
   * @param {String} action
   * @param {Object} args
   * @returns {Promise}
   */
  execAction(action, args) {
    return this.getTangram().then((tangram) => {
      this._updateActionState(action, { loading: true });
      return tangram.execAction(action, args).then((res) => {
        this._updateData(action, res);
        return res;
      }).catch((e) => {
        this._updateActionState(action, { error: true, message: e.message });
        throw e;
      });
    });
  }
  _getActionStateByStoreKey(key) {
    const fullKeys = this._storeKeys[key].split('.');
    const action = fullKeys[0] + '.' + fullKeys[1];
    return this._actionStates[action] || {};
  }
  _getDataByStoreKey(key) {
    const fullKeys = this._storeKeys[key].split('.');
    const data = this._cache[fullKeys[0] + '.' + fullKeys[1]];
    return getValByKeys(data, fullKeys.slice(2));
  }
  getStore(storeKeys) {
    storeKeys = typeof storeKeys === 'string' ? [storeKeys] : storeKeys;
    return storeKeys.reduce((obj, key) => {
      if (!this._storeKeys[key]) throw new Error('Unknown store key: ' + key);
      obj[key] = {
        state: this._getActionStateByStoreKey(key),
        data: this._getDataByStoreKey(key),
      };
      return obj;
    }, {});
  }
  /**
   * @returns {Promise<Tangram>}
   */
  getTangram() {
    if (this._tangram) return Promise.resolve(this._tangram);
    const schemas = typeof this._opts.schemas === 'function'
      ? this._opts.schemas()
      : this._opts.schemas;
    if (schemas.then) {
      return schemas.then((res) => {
        this._tangram = new ClientTangram(res, { store: this });
        return this._tangram;
      });
    }
    this._tangram = new ClientTangram(schemas, { store: this });
    return Promise.resolve(this._tangram);
  }
}
