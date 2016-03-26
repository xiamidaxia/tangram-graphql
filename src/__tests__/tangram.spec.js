import todoTangram from './todoTangram';
import { expect } from 'chai';
// import mongoose from 'mongoose';
describe('Tangram graphql', () => {
  it('query list.', async() => {
    const query = `
      query {
        users {
          name
        }
      }
    `;
    const expected = {
      users: [
        { 'name': 'Nick' },
        { 'name': 'Jimmy' },
        { 'name': 'Jack' },
      ],
    };
    expect(await todoTangram.exec('User', query)).to.eql(expected);
  });
  it('query firstOne.', async() => {
    expect(await todoTangram.exec('User', `
      query {
        user {
          name
        }
      }
    `)).to.eql({ user: { 'name': 'Nick' } });
  });
  it('query by id', async() => {
    expect(await todoTangram.exec('User', `
      query {
        user(id: "3") {
          name
        }
      }
    `)).to.eql({ user: { 'name': 'Jack' } });
  });
  it('query empty', async() => {
    expect(await todoTangram.exec('User', `
      query {
        user(id: "unknown id") {
          name
        }
      }
    `)).to.eql({ user: null });
  });
  it('query nested.', async() => {
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
        addTodo(INPUT: $input) {
          id
          name
          user {
            name
          }
        }
      }
    `, {
      input: { name: 'JackTodo', user: 3 },
    })).to.eql({ addTodo: { id: '1_4', name: 'JackTodo', user: { name: 'Jack' } } });
  });
});
