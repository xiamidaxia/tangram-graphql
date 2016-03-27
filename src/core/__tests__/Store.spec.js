import Store from '../Store';
import MongoTangram from '../MongoTangram';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { UserSchema, TodoSchema } from '../../__tests__/schemas';

describe('Store', () => {
  const serverTangram = new MongoTangram([UserSchema, TodoSchema], { mongoose });
  const todoStore = new Store({
    userInfo: 'User.queryUserById.user',
    todoList: 'Todo.queryTodosByUser.todos',
  }, {
    schemas: () => {
      return new Promise((res) => {
        setTimeout(() => {
          res([UserSchema, TodoSchema]);
        }, 10);
      });
    },
    fetcher: (method, schema, params) => {
      return serverTangram.resolve(method, schema, params);
    },
  });
  it('subcribe data.', async () => {
    expect(() => {
      todoStore.subscribe('unknownKey');
    }).to.throw(/Unknown store key/);
    let count = 0;
    todoStore.subscribe(['userInfo', 'todoList'], (data) => {
      expect(data.userInfo).to.have.keys(['state', 'data']);
      expect(data.todoList).to.have.keys(['state', 'data']);
      count ++;
    });
    await todoStore.dispatch('User.queryUserById', { userId: 1 });
    expect(count).to.eql(3);
  });
  it('exec action and update data.', () => {
    // const data = await todoStore.dispatch('User.queryUserById', { userId: 1 });
    // console.log('dispatch result: ', data);
  });
});
