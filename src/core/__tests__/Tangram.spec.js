import Tangram from '../Tangram';
import { expect } from 'chai';
describe('Tangram base', () => {
  let tangram;
  beforeEach(() => {
    tangram = new Tangram;
  });
  it('add common hooks', async () => {
    const _args = { count: 0 };
    const _schema = { schema: true };
    const _result = { resultData: true };
    const hooks = {
      pre({ schema, args }) {
        expect(schema).to.eql(_schema);
        expect(this).to.eql(tangram);
        expect(args.count).to.eql(0);
        args.count ++;
        return { schema, args };
      },
      after({ result, schema, args }) {
        expect(result).to.eql(_result);
        return { result, schema, args };
      },
    };
    tangram.addHooks(hooks);
    tangram.addOne = (schema, args) => {
      expect(schema).to.eql(_schema);
      expect(args.count).to.eql(1);
      return _result;
    };
    const result = await tangram.resolve('addOne', _schema, _args);
    expect(result).to.eql(_result);
  });
});
