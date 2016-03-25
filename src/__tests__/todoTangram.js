import Tangram from '../core/Tangram';
import Schema from '../core/Schema';
import { UserSchema, TodoSchema } from './schemas';

export const users = [{
  id: '1',
  name: 'Nick',
  age: 22,
  friends: ['2', '3'],
}, {
  id: '2',
  name: 'Jimmy',
  age: 21,
}, {
  id: '3',
  name: 'Jack',
  age: 20,
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

class TodoTangram extends Tangram {
  queryById(schema, id) {
    switch (schema.name) {
      case 'User':
        return users.find(item => String(item.id) === id);
      case 'Todo':
        return todos.find(item => String(item.id) === id);
    }
  }
  queryOne(schema, args) {
    if (args.id) return this.queryById(schema, args.id);
    switch (schema.name) {
      case 'User':
        return users[0];
      case 'Todo':
        return todos[0];
    }
  }
  queryList(schema, args) {
    if (args.id) return [this.queryById(schema, args.id)];
    switch (schema.name) {
      case 'User':
        return users;
      case 'Todo':
        return todos;
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
  addOne(schema, args) {
    const input = args.INPUT;
    input.createAt = (new Date).toJSON();
    input.id = todos.length;
    todos.push(input);
    return input;
  }
}
const User = new Schema(UserSchema);
const Todo = new Schema(TodoSchema, { User });
// $inc $push $pop 插入
export default new TodoTangram({ User, Todo });
