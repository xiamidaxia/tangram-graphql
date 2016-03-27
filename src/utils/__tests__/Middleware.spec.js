import { expect } from 'chai';
import Middleware from '../Middleware';
describe('Middleware', () => {
  it('should work properly', async () => {
    const ctx = { inCtx: true };
    const middleware = new Middleware(ctx);
    const fn1 = ({ data }) => {
      expect(data).to.be.eql(1);
      return { data: 2 };
    };
    middleware.use(fn1);
    const fn2 = function ({ data }) {
      expect(data).to.be.eql(2);
      expect(this).to.be.eql(ctx);
      return { data: 3 };
    };
    middleware.use(fn2);
    const res = await middleware.compose({ data: 1 });
    expect(res.data).to.eql(3);
  });
  it('should catch hook error', (done) => {
    const middleware = new Middleware();
    middleware.use(() => {
      throw new Error('An error!');
    });
    middleware.compose(null).catch(() => {
      done();
    });
  });
});
