import Store from '../core/Store';
import todoTangram, { User, Todo } from './todoTangram';

const todoStore = new Store({
  userInfo: 'User.queryUserById.user',
  todoList: 'Todo.queryTodosByUser.todos',
}, {
  schemas: () => {
    return new Promise((res) => {
      setTimeout(() => {
        res([User, Todo]);
      }, 10);
    });
  },
  fetch: (action, params) => {
    const [schemaName, actionName] = action;
    const schema = todoTangram.getSchema(schemaName);
    return todoTangram.exec(schema, schema.action[actionName], params);
  },
});

todoStore.subscribe();
