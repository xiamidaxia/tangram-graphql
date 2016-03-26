const UserSchema = {
  name: 'User',
  type: 'Collection',
  struct: {
    name: { type: 'String!', max: 20, min: 5 },
    age: { type: 'Number!' },
    friends: { type: '[User]', defaultValue: [] },
  },
  actions: {
    addUser: `mutation {
      addUser(_input: $form) {
        id
        name
        users {
        }
      }
    }`,
    removeUser: ``,
    getFriends: `{
    }`,
    addFriends: `mutation updateUser(_id: $id, ) {
    }`,
  },
};

const TodoSchema = {
  name: 'Todo',
  type: 'Collection',
  refs: ['User'],
  struct: {
    name: { type: 'String!', trim: true },
    completed: { type: 'Boolean', defaultValue: false },
    user: { type: 'User!' },
    createAt: { type: 'Date', defaultValue: 'DATE_NOW' },
    num: { type: 'Number' },
  },
  actions: {
    queryTodosByUser: `
      query {
        todos(user: $userId) {
          id
          name
          completed
          user {
            id
            name
            age
          }
        }
      }
    `,
  },
};

export {
  UserSchema,
  TodoSchema,
};
