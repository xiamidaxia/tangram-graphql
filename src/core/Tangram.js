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
import { mapValues } from '../common/utils';
import queryArg from '../types/queryArg';

const scalarTypes = {
  String: GraphQLString,
  Number: GraphQLFloat,
  Boolean: GraphQLBoolean,
  Array: GraphQLList,
  Buffer: GraphQlBuffer,
  ObjectId: GraphQLID,
  Date: GraphQlDate,
};

/**
 * @class Tangram
 * // todo: INC, ORDER_BY, PAGE, lt, gt, gte, lte, in, or, nin, not
 */
export default class Tangram {
  constructor(schemaMap = {}) {
    this._schemaMap = schemaMap;
    this._graphQLSchemas = [];
  }
  queryById() {}
  queryOne() {}
  queryList() {}
  queryCount() {}
  addOne() {}
  deleteOne() {}
  deleteList() {}
  updateOne() {}
  updateList() {}
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
   * @param {String} id
   * @returns {string}
   */
  fromGlobalId(id) {
    return id.replace(/^\d+\_/, '');
  }
  /**
   * @param {Schema|String} schema
   * @returns {GraphQLSchema}
   */
  getGraphQLSchema(schema) {
    return this._getSchemaInfo(schema).graphQLSchema;
  }
  /**
   * @param {Schema|String} schema
   * @returns {{schema: Schema, graphQLSchema, graphQLType}}
   * @private
   */
  _getSchemaInfo(schema) {
    const _schema = typeof schema === 'string' ? this._schemaMap[schema] : schema;
    if (!_schema) throw new Error(`Unknow schema ${schema}`);
    return this._graphQLSchemas.find(obj => obj.schema === _schema)
      || this._createGraphQLSchema(_schema);
  }
  /**
   * @param {Schema} schema
   * @returns {{schema: Schema, graphQLSchema, graphQLType}}
   * @private
   */
  _createGraphQLSchema(schema) {
    const { name } = schema;
    const graphQLType = this._getGraphQLType(schema);
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
            resolve: (_, args) => this.queryOne(schema, args),
          },
          [nameLowerCase + 's']: {
            type: new GraphQLList(graphQLType),
            args,
            resolve: (_, args) => this.queryList(schema, args),
          },
          [nameLowerCase + 'Count']: {
            type: GraphQLInt,
            args,
            resolve: (_, args) => this.queryCount(schema, args),
          },
        },
      }),
      mutation: new GraphQLObjectType({
        name: `Root${schema}MutationType`,
        fields: {
          ['add' + nameUpperCase]: {
            type: graphQLType,
            args: { INPUT: { type: inputType } },
            resolve: (_, args) => this.addOne(schema, args),
          },
          ['delete' + nameUpperCase]: {
            type: graphQLType,
            args,
            resolve: (_, args) => this.deleteOne(schema, args),
          },
          ['delete' + nameUpperCase + 's']: {
            type: new GraphQLList(graphQLType),
            args,
            resolve: (_, args) => this.deleteList(schema, args),
          },
          ['update' + nameUpperCase]: {
            type: graphQLType,
            args: { ...args, INPUT: { type: inputType } },
            resolve: (_, args) => this.updateOne(schema, args),
          },
          ['update' + nameUpperCase + 's']: {
            type: new GraphQLList(graphQLType),
            args: { ...args, INPUT: { type: inputType } },
            resolve: (_, args) => this.updateList(schema, args),
          },
        },
      }),
    });
    const res = {
      schema,
      graphQLSchema,
      graphQLType,
    };
    this._graphQLSchemas.push(res);
    return res;
  }
  _getInputType(schema) {
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
          return required ? { type: new GraphQLNonNull(type), defaultValue } : { type, defaultValue };
        });
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
          if (typeStr === 'Array' && ref) {
            if (scalarTypes[ref]) {
              type = new GraphQLList(scalarTypes[ref]);
            } else if (refs[ref]) {
              const refType = ref === name ? graphQLType : this._getSchemaInfo(refs[ref]).graphQLType;
              type = new GraphQLList(refType);
              resolve = parent => this.queryById(refs[ref], String(parent[key]));
            } else {
              throw new Error(`Schema ${schema} relies on ${ref}.`);
            }
          } else if (scalarTypes[typeStr]) {
            type = scalarTypes[typeStr];
          } else if (refs[typeStr]) {
            const refType = ref === name ? graphQLType : this._getSchemaInfo(refs[typeStr]).graphQLType;
            type = refType;
            resolve = parent => this.queryById(refs[typeStr], String(parent[key]));
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
    const numFields = [];
    args.id = {
      type: queryArg('id', 'ID'),
      description: `The ID of ${schema}`,
    };
    Object.keys(schema.struct).forEach((key) => {
      const sch = schema.struct[key];
      const typeName = sch.type;
      const ref = schema.refs[sch.ref] || schema.refs[sch.type];
      if (scalarTypes[typeName]) {
        args[key] = {
          type: queryArg(key, typeName),
        };
        if (typeName === 'Number') {
          numFields.push(key);
        }
      } else if (ref) {
        args[key] = {
          type: queryArg(key, 'ID'),
        };
      }
    });
    // number fields
    if (numFields.length > 0) {
      args.INC = {
        type: new GraphQLInputObjectType({
          name: `IncArg`,
          fields: numFields.reduce((obj, key) => {
            obj[key] = { type: GraphQLFloat };
            return obj;
          }, {}),
        }),
      };
    }
    return args;
  }

  /**
   * @param {String} schemaName - schema name
   * @param {String} graphQLStr - graphql string
   * @returns {Promise}
   */
  exec(schemaName, graphQLStr) {
    return graphql(this.getGraphQLSchema(schemaName), graphQLStr).then((resData) => {
      if (resData.errors && resData.errors.length !== 0) {
        throw resData.errors[0];
      }
      return resData.data;
    });
  }
}
