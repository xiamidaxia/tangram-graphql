import { Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';
import { GraphQLScalarType } from 'graphql';
import GraphQLDate from './GraphQlDate';

export default function queryArg(key, type) {
  const fn = val => val;
  return new GraphQLScalarType({
    name: `${key}${type}Arg`,
    serialize: fn,
    parseValue: fn,
    parseLiteral: (ast) => {
      if (type === 'ID') {
        return String(ast.value);
      } else if (type === 'Date') {
        try {
          return GraphQLDate._scalarConfig.parseLiteral(ast);
        } catch (e) {
          throw new GraphQLError(e.message + ` on Argument "${key}".`);
        }
      } else if (type === 'Number' && ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
        return Number(ast.value);
      } else if (ast.kind === Kind[type.toUpperCase()]) {
        return ast.value;
      }
      throw new GraphQLError(`Query error: argument "${key}" is not a ${type}`);
    },
  });
}
