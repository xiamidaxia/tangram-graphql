import todoTangram from './todoTangram';
import { expect } from 'chai';
import { graphql } from 'graphql';
// import mongoose from 'mongoose';
describe('Tangram graphql', () => {
  const queryUser = (qStr) => {
    return graphql(todoTangram.getGraphQLSchema('User'), qStr).then((resData) => {
      if (resData.errors && resData.errors.length !== 0) {
        throw resData.errors[0];
      }
      return resData.data;
    });
  };
  const queryTodo = (qStr) => {
    return graphql(todoTangram.getGraphQLSchema('Todo'), qStr).then((resData) => {
      if (resData.errors && resData.errors.length !== 0) {
        throw resData.errors[0];
      }
      return resData.data;
    });
  };
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
    expect(await queryUser(query)).to.eql(expected);
  });
  it('query firstOne.', async() => {
    expect(await queryUser(`
      query {
        user {
          name
        }
      }
    `)).to.eql({ user: { 'name': 'Nick' } });
  });
  it('query by id', async() => {
    expect(await queryUser(`
      query {
        user(id: "3") {
          name
        }
      }
    `)).to.eql({ user: { 'name': 'Jack' } });
  });
  it('query empty', async() => {
    expect(await queryUser(`
      query {
        user(id: "unknown id") {
          name
        }
      }
    `)).to.eql({ user: null });
  });
  it('query nested.', async() => {
    expect(await queryTodo(`
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
  it('mutation add', async() => {
    expect(await queryTodo(`
      mutation {
        addTodo(INPUT: {name: "JackTodo", user: 3}) {
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
