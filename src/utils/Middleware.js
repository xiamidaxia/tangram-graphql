import { isFunction } from './utils';
export default class Middleware {
  middleware = [];

  constructor(ctx, middleware) {
    this.ctx = ctx || this;
    this.use(middleware);
  }

  /**
   * Add middleware
   * @param  {Function} middleware
   */
  use(middleware = []) {
    if (!Array.isArray(middleware)) {
      middleware = [middleware];
    }
    for (const fn of middleware) {
      if (!isFunction(fn)) {
        throw new TypeError('Middleware must be composed of functions!');
      }
    }
    this.middleware = [...this.middleware, ...middleware];
  }

  /**
   * Compose all middleware
   * @param {*} data
   * @return {Promise}
   */
  compose(data) {
    const ctx = this.ctx;
    return this.middleware.reduce((pm, fn) => {
      return pm.then((nextData) => {
        return fn.call(ctx, nextData);
      });
    }, Promise.resolve(data));
  }
}
