import Tangram from '../core/Tangram';
import Schema from '../core/Schema';
import { UserSchema, TodoSchema } from './schemas';
function filter(arr, args) {
  return arr.filter((item) => {
    for (const i in args) {
      if (i === 'id') {
        if (String(item[i]) !== String(args[i])) {
          return false;
        }
      } else if (item[i] !== args[i]) {
        return false;
      }
    }
    return true;
  });
}
export const users = [{
  id: '1',
  name: 'Nick',
  age: 22,
  friends: ['2', '3'],
}, {
  id: '2',
  name: 'Jimmy',
  age: 20,
  friends: [],
}, {
  id: '3',
  name: 'Jack',
  age: 20,
  friends: ['1', '2'],
}];
export const todos = [{
  id: 0,
  name: 'NickTodo1',
  completed: false,
  num: 3,
  createAt: Date.now(),
  user: '1',
}, {
  id: 1,
  name: 'NickTodo2',
  completed: true,
  num: 4,
  createAt: Date.now() + 300,
  user: '1',
}, {
  id: 2,
  name: 'NickTodo3',
  completed: true,
  createAt: Date.now() + 400,
  num: 4,
  user: '1',
}, {
  id: 3,
  name: 'JimmyTodo1',
  num: 8,
  createAt: Date.now() + 500,
  completed: true,
  user: '2',
}];

function getData(schema) {
  switch (schema.name) {
    case 'User':
      return users;
    case 'Todo':
      return todos;
  }
}

class TodoTangram extends Tangram {
  queryById(schema, id) {
    const data = getData(schema);
    return data.find(item => String(item.id) === id);
  }
  queryOne(schema, args) {
    const data = getData(schema);
    return filter(data, args)[0];
  }
  queryList(schema, args) {
    switch (schema.name) {
      case 'User':
        return filter(users, args);
      case 'Todo':
        return filter(todos, args);
    }
  }
  queryCount(schema) {
    switch (schema.name) {
      case 'User':
        return users.length;
      case 'Todo':
        return todos.length;
    }
  }
  updateOne(schema, params) {
    console.log(params.INPUT);
    const data = getData(schema);
    const INPUT = params.INPUT;
    delete params.INPUT;
    const finded = filter(data, params)[0];
    return { ...finded, ...INPUT };
  }
  addOne(schema, args) {
    const input = args.INPUT;
    input.createAt = (new Date).toJSON();
    input.id = todos.length;
    todos.push(input);
    return input;
  }
}
export const User = new Schema(UserSchema);
export const Todo = new Schema(TodoSchema, { User });
// $inc $push $pop 插入
export default new TodoTangram([User, Todo]);
