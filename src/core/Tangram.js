import {
  // GraphQLEnumType,
  graphql,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql';
import GraphQlBuffer from '../types/GraphQLBuffer';
import GraphQlDate from '../types/GraphQLDate';
import ArrayInputType from '../types/ArrayInputType';
import NumberInputType from '../types/NumberInputType';
import NumberQueryType from '../types/NumberQueryType';
import ArrayQueryType from '../types/ArrayQueryType';
import { mapValues, Middleware, hooksMerge, isFunction } from '../utils';
import Schema from './Schema';
const scalarTypes = {
  String: GraphQLString,
  Boolean: GraphQLBoolean,
  Int: GraphQLInt,
  Float: GraphQLFloat,
  Buffer: GraphQlBuffer,
  ObjectId: GraphQLID,
  Date: GraphQlDate,
};
/**
 * @class Tangram
 */
export default class Tangram {
  constructor(schemas = [], opts = {}) {
    this._schemas = {};
    this._hooks = {};
    if (opts.hooks) {
      mapValues(opts.hooks, (hook, name) => {
        this.addHooks(name, hook);
      });
    }
    schemas.forEach((schema) => {
      this._addSchema(schema, schemas);
    });
    this._graphQLSchemas = {};
  }

  /**
   * @param {Object} schema
   * @param {Array} schemas
   * @return {Schema}
   * @private
   */
  _addSchema(schema, schemas) {
    if (this._schemas[schema.name]) {
      return this._schemas[schema.name];
    }
    if (schema instanceof Schema) {
      this._schemas[schema] = schema;
      return schema;
    }
    const deps = {};
    if (schema.refs && schema.refs.length !== 0) {
      schema.refs.forEach((str) => {
        if (this._schemas[str]) {
          deps[str] = this._schemas[str];
        } else if (schemas[str]) {
          deps[str] = this._addSchema(schemas[str], schemas);
        } else {
          throw new Error(`Miss schema ${str}.`);
        }
      });
    }
    this._schemas[schema.name] = new Schema(schema, deps);
  }
  queryById() {
  }

  queryOne() {
  }

  queryList() {
  }

  queryCount() {
  }

  addOne() {
  }

  deleteOne() {
  }

  deleteList() {
  }

  updateOne() {
  }

  updateList() {
  }

  /**
   * @param {Schema} schema
   * @param {Object} data,
   * @param {GraphQLResolveInfo} graphQLResolveInfo
   * @return {String}
   */
  idFetcher(schema, data) {
    return this.toGlobalId(schema, data.id);
  }

  /**
   * @param {Schema} schema
   * @param {String} id
   * @returns {string}
   */
  toGlobalId(schema, id) {
    return String(schema.id + '_' + id);
  }

  /**
   * @param {String} globalId
   * @returns {string}
   */
  fromGlobalId(globalId) {
    return globalId.replace(/^\d+\_/, '');
  }

  /**
   * @param {Schema|String} schema
   * @returns {GraphQLSchema}
   */
  getGraphQLSchema(schema) {
    return this._getGraphQLInfo(schema).graphQLSchema;
  }

  /**
   * @param {String} schema
   * @returns {Schema}
   */
  getSchema(schema) {
    const _schema = this._schemas[schema];
    if (!_schema) throw new Error(`Unknown schema "${schema}"`);
    return _schema;
  }

  /**
   * @param {Schema|String} schema
   * @returns {{schema: Schema, graphQLSchema, graphQLType}}
   * @private
   */
  _getGraphQLInfo(schema) {
    const _schema = this.getSchema(schema);
    return this._graphQLSchemas[_schema] || this._createGraphQLSchema(_schema);
  }

  /**
   * @param {Schema} schema
   * @returns {{schema: Schema, graphQLSchema, graphQLType}}
   * @private
   */
  _createGraphQLSchema(schema) {
    const { name } = schema;
    const graphQLType = this._getGraphQLType(schema);
    const setType = this._getSetType(schema);
    const inputType = this._getInputType(schema);
    const nameLowerCase = name[0].toLowerCase() + name.slice(1);
    const nameUpperCase = name[0].toUpperCase() + name.slice(1);
    const args = this._getArgs(schema);
    const graphQLSchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: `Root${schema}QueryType`,
        fields: {
          [nameLowerCase]: {
            type: graphQLType,
            args,
            resolve: (_, args) => this.resolve('queryOne', schema, args),
          },
          [nameLowerCase + 's']: {
            type: new GraphQLList(graphQLType),
            args,
            resolve: (_, args) => this.resolve('queryList', schema, args),
          },
          [nameLowerCase + 'Count']: {
            type: GraphQLInt,
            args,
            resolve: (_, args) => this.resolve('queryCount', schema, args),
          },
        },
      }),
      mutation: new GraphQLObjectType({
        name: `Root${schema}MutationType`,
        fields: {
          ['add' + nameUpperCase]: {
            type: graphQLType,
            args: { INPUT: { type: inputType } },
            resolve: (_, args) => this.resolve('addOne', schema, args),
          },
          ['delete' + nameUpperCase]: {
            type: graphQLType,
            args,
            resolve: (_, args) => this.resolve('deleteOne', schema, args),
          },
          ['delete' + nameUpperCase + 's']: {
            type: new GraphQLList(graphQLType),
            args,
            resolve: (_, args) => this.resolve('deleteList', schema, args),
          },
          ['update' + nameUpperCase]: {
            type: graphQLType,
            args: { ...args, SET: { type: setType } },
            resolve: (_, args) => this.resolve('updateOne', schema, args),
          },
          ['update' + nameUpperCase + 's']: {
            type: new GraphQLList(graphQLType),
            args: { ...args, SET: { type: setType } },
            resolve: (_, args) => this.resolve('updateList', schema, args),
          },
        },
      }),
    });
    const res = {
      graphQLSchema,
      graphQLType,
    };
    this._graphQLSchemas[schema] = res;
    return res;
  }

  _getInputType(schema, unRequired) {
    const { name, refs, struct } = schema;
    return new GraphQLInputObjectType({
      name: name + 'Input',
      fields: () => {
        return mapValues(struct, ({ type: typeStr, required, ref, defaultValue }) => {
          let type;
          if (typeStr === 'Array' && ref) {
            type = new GraphQLList(scalarTypes[ref] || GraphQLID);
          } else if (scalarTypes[typeStr]) {
            type = scalarTypes[typeStr];
          } else if (refs[typeStr]) {
            type = GraphQLID;
          } else {
            throw new Error(`Schema ${schema} relies on ${typeStr}.`);
          }
          return (!unRequired && required) ? { type: new GraphQLNonNull(type), defaultValue } : { type, defaultValue };
        });
      },
    });
  }

  _getSetType(schema) {
    const inputType = this._getInputType(schema, true);
    const { name, struct } = schema;
    return new GraphQLInputObjectType({
      name: name + 'Set',
      fields: () => {
        const setFields = inputType._typeConfig.fields();
        mapValues(struct, ({ type: typeStr }, key) => {
          let type;
          if (typeStr === 'Array') {
            type = ArrayInputType;
          } else if (typeStr === 'Int' || typeStr === 'Float') {
            type = NumberInputType;
          }
          if (type) {
            setFields['_' + key] = {
              type,
              description: `Special input params of ${typeStr}`,
            };
          }
        });
        return setFields;
      },
    });
  }

  _getGraphQLType(schema) {
    const { name, refs, struct } = schema;
    const graphQLType = new GraphQLObjectType({
      name,
      fields: () => {
        const id = {
          name: 'id',
          description: `The ID of ${schema}`,
          type: new GraphQLNonNull(GraphQLID),
          resolve: (obj, args, info) => {
            return this.idFetcher(schema, obj, info);
          },
        };
        return mapValues(struct, ({ type: typeStr, required, ref }, key) => {
          let type;
          let resolve;
          if (typeStr === 'Array') {
            if (scalarTypes[ref]) {
              type = new GraphQLList(scalarTypes[ref]);
            } else if (refs[ref]) {
              const refType = ref === name ? graphQLType : this._getGraphQLInfo(refs[ref]).graphQLType;
              type = new GraphQLList(refType);
              resolve = parent => {
                return parent[key] && parent[key].map(val => this.resolve('queryById', refs[ref], String(val)));
              };
            } else {
              throw new Error(`Schema ${schema} relies on ${ref}.`);
            }
          } else if (scalarTypes[typeStr]) {
            type = scalarTypes[typeStr];
          } else if (refs[typeStr]) {
            const refType = ref === name ? graphQLType : this._getGraphQLInfo(refs[typeStr]).graphQLType;
            type = refType;
            resolve = parent => {
              return this.resolve('queryById', refs[typeStr], String(parent[key]));
            };
          } else {
            throw new Error(`Schema ${schema} relies on ${typeStr}.`);
          }
          return required ? { type: new GraphQLNonNull(type), resolve } : { type, resolve };
        }, { id });
      },
    });
    return graphQLType;
  }

  _getArgs(schema) {
    const args = {};
    args.id = {
      type: GraphQLID,
      description: `The ID of ${schema}`,
    };
    Object.keys(schema.struct).forEach((key) => {
      const sch = schema.struct[key];
      const typeName = sch.type;
      const ref = schema.refs[sch.ref] || schema.refs[sch.type];
      if (typeName === 'Array') {
        args['_' + key] = {
          type: ArrayQueryType,
          description: `Array query type of ${schema}.${key}`,
        };
      } else if (typeName === 'Int' || typeName === 'Float') {
        args['_' + key] = {
          type: NumberQueryType,
          description: `Number query type of ${schema}.${key}`,
        };
      }
      if (scalarTypes[typeName]) {
        args[key] = {
          type: scalarTypes[typeName],
          description: `The ${typeName} of ${schema}.${key}`,
        };
      } else if (ref) {
        args[key] = {
          type: GraphQLID,
          description: `The ref "${ref}" of ${schema}`,
        };
      }
    });
    return args;
  }

  /**
   * @param {String} schemaName - schema name
   * @param {String} graphQLStr - graphql string
   * @param {Object} params
   * @returns {Promise}
   */
  exec(schemaName, graphQLStr, params = {}) {
    return graphql(this.getGraphQLSchema(schemaName), graphQLStr, null, params).then((resData) => {
      if (resData.errors && resData.errors.length !== 0) {
        throw resData.errors[0];
      }
      return resData.data;
    });
  }

  execAction(action, params = {}) {
    const [schemaName, actionName] = action.split('.');
    const schema = this.getSchema(schemaName);
    return this.exec(schemaName, schema.getActionQL(actionName), params);
  }
  resolve(method, schema, args) {
    if (this._hooks.all || this._hooks[method]) {
      const { pre: preStack, after: afterStack } = hooksMerge(this._hooks.all, this._hooks[method]);
      const middleware = new Middleware(this);
      middleware.use(preStack);
      middleware.use(async ({ args }) => {
        return {
          result: await this[method](schema, args),
          args,
          method,
          schema,
        };
      });
      middleware.use(afterStack);
      middleware.use(({ result }) => {
        return result;
      });
      return middleware.compose({ args, schema, method });
    }
    return this[method](schema, args);
  }
  addHooks(name, hooks = {}) {
    if (typeof name !== 'string') {
      hooks = name;
      name = 'all';
    }
    if (hooks.pre && !isFunction(hooks.pre)
      || (hooks.after && !isFunction(hooks.after))
    ) {
      throw new TypeError('Hooks must be composed of functions!');
    }
    hooks = {
      pre: hooks.pre ? [hooks.pre] : [],
      after: hooks.after ? [hooks.after] : [],
    };
    this._hooks[name] = hooksMerge(this._hooks[name], hooks);
  }
}
