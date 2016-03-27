import todoTangram from './todoTangram';
import { expect } from 'chai';
// import mongoose from 'mongoose';
describe('Tangram graphql', () => {
  it('query by id', async() => {
    const expected = {
      user: {
        id: '0_3',
        name: 'Jack',
        age: 20,
        friends: [{ name: 'Nick' }, { name: 'Jimmy' }],
      },
    };
    expect(await todoTangram.execAction('User.queryUserById', {
      userId: '3',
    })).to.eql(expected);
  });
  it('query empty', async() => {
    expect(await todoTangram.execAction('User.queryUserById', {
      userId: 'Unknow id',
    })).to.eql({ user: null });
  });
  it('query params required', async() => {
    return todoTangram.execAction('User.queryUserById').catch((e) => {
      expect(e).to.match(/required type "ID!"/);
    });
  });
  it('query by params', async() => {
    const result = {
      users: [
        { name: 'Jimmy', age: 20 },
        { name: 'Jack', age: 20 },
      ],
    };
    expect(await todoTangram.execAction('User.queryUsersByAge', {
      age: 20,
    })).to.containSubset(result);
  });
  it('mutation set fields', async() => {
    expect(await todoTangram.execAction('User.changeUserName', {
      userId: '1',
      newName: 'newName',
    })).to.eql({
      updateUser: { id: '0_1', name: 'newName' },
    });
  });
  it('query Todo populate User.', async() => {
    expect(await todoTangram.exec('Todo', `
      query {
        todo(id: 2) {
          name
          user {
            name
          }
        }
      }
    `)).to.eql({ todo: { name: 'NickTodo3', user: { name: 'Nick' } } });
  });
  it('mutation add with param', async() => {
    expect(await todoTangram.exec('Todo', `
      mutation {
        addTodo(INPUT: { name: "JackTodo", user: 3 }) {
          id
          name
          user {
            name
          }
        }
      }
    `)).to.eql({ addTodo: { id: '1_4', name: 'JackTodo', user: { name: 'Jack' } } });
  });
});
