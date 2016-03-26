const UserSchema = {
  name: 'User',
  type: 'Collection',
  struct: {
    name: { type: 'String!', max: 20, min: 5 },
    age: { type: 'Int!' },
    friends: { type: '[User]', defaultValue: [] },
  },
  fragments: `
    fragment userFragment on User {
      id
      name
      age
    }
  `,
  actions: {
    queryUserById: `
      query($userId: ID!){
        user(id: $userId) {
          ...userFragment
          friends {
            name
          }
        }
      }
    `,
    queryUsersByAge: `
      query($age: Int!) {
        users(age: $age) {
          ...userFragment
          friends {
            ...userFragment
          }
        }
      }
    `,
    changeUserName: `
      mutation($userId: ID!, $newName: String!) {
        updateUser(id: $userId, INPUT: {name: $newName}) {
          id
          name
        }
      }
    `,
    addFriends: `
      mutation($userId: ID!, $friends: [ID]!){
        updateUser(id: $userId, INPUT: { _friends: { concat: $friends } }) {
          id
          friends {
            id
          }
        }
      }
    `,
    addUser: `
      mutation($userInput: User) {
        addUser(INPUT: $userInput) {
          ...userFragment
          fiends {
            ...userFragment
          }
        }
      }
    `,
    deleteUser: `
      mutation($userId: ID) {
        deleteUser(id: $userId) {
          id
        }
      }
    `,
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
    createAt: { type: 'Date' },
  },
  actions: {
    queryTodosByUser: `
      query($userId: ID) {
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
