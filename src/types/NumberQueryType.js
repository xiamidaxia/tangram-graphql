import {
  GraphQLInputObjectType,
  GraphQLInt,
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'NumberQuery',
  fields: () => {
    return {
      'lt': {
        type: GraphQLInt,
      },
      'lte': {
        type: GraphQLInt,
      },
      'gt': {
        type: GraphQLInt,
      },
      'gte': {
        type: GraphQLInt,
      },
    };
  },
});
