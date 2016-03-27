import { expect } from 'chai';
import Schema from '../Schema';

describe('Schema', () => {
  it('should required name, type, struct', () => {
    expect(() => {
      return new Schema({});
    }).to.throw(/need name/);
    expect(() => {
      return new Schema({ name: 'abc' });
    }).to.throw(/need type/);
    expect(() => {
      return new Schema({ name: 'abc', type: 'Collection' });
    }).to.throw(/need struct/);
  });
  it('should name and type variable.', () => {
    expect(() => {
      return new Schema({ name: '123' });
    }).to.throw(/name illegal/);
    expect(() => {
      return new Schema({ name: 'abc', type: 'UnknownType' });
    }).to.throw(/Unknown schema type/);
  });
  it('should refs instance of Schema', () => {
    expect(() => {
      return new Schema({ name: 'abc', type: 'Collection', struct: {} }, { User: 'User' });
    }).to.throw(/User must instance of Schema/);
  });
  it('should refs required', () => {
    expect(() => {
      return new Schema({ name: 'abc', type: 'Collection', struct: {}, refs: ['User'] });
    }).to.throw(/depends on User/);
    expect(() => {
      return new Schema({ name: 'abc', type: 'Collection', struct: { user: { type: 'User' } } });
    }).to.throw(/depends on User/);
    expect(() => {
      return new Schema({ name: 'abc', type: 'Collection', struct: { user: { type: '[User]!' } } });
    }).to.throw(/depends on User/);
  });
});
