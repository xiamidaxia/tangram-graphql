import Tangram from './Tangram';

export default class ClientTangram extends Tangram {
  constructor(schemas, { store }) {
    super(...arguments);
    this._store = store;
    this.addHooks({
      after: async ({ args, schema, method }) => {
        return {
          result: await this._store._opts.fetcher(method, schema, args),
          schema,
          args,
          method,
        };
      },
    });
  }
}
