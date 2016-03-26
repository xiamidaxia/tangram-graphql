import { autoBind } from '../common/utils';
import { EventEmitter } from 'events';
export default class Store extends EventEmitter {
  constructor() {
    super();
    this._cache = {};
    this._schemas = {};
    this._actionStates = {};
    autoBind(this, ['connect', 'dispatch', 'getActionState']);
  }

  subscribe(schemas, cb) {
    schemas = typeof schemas === 'string' ? [schemas] : schemas;
    this.on('update', () => {
      cb(this.getSchemaDataFromCache(schemas));
    });
  }
  connect() {
    return {
      getActionState: this.getActionState,
      dispatch: this.dispatch,
    };
  }
  dispatch(actions, series) {
    if (typeof actions === 'string') {
      return this.execAction(actions);
    }
    if (!series) {
      return Promise.all(actions.map((action) => this.execAction(action)));
    }
    const res = [];
    let p = Promise.resolve();
    actions.forEach((action) => {
      p = p.then(() => {
        return this.execAction(action);
      }).then((data) => {
        res.push(data);
      });
    });
    return p.then(() => res);
  }

  setActionState(action, state) {
    this._actionStates = { ...this._actionStates, [action]: state };
  }

  execAction(action) {
    const [schema, actionName] = action.split('.');
    this.setActionState(action, { ready: false });
    return this._schemas[schema].action(actionName).then(() => {
      this.setActionState(action, { ready: true, success: true });
    }).catch((e) => {
      this.setActionState(action, { ready: true, success: false, message: e.message });
      throw e;
    });
  }
  getActionState(action) {
    return this._actionStates[action];
  }
  getSchemaDataFromCache() {
  }
}
