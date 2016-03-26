import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'ArrayInput',
  fields: () => {
    return {
      'concat': {
        type: new GraphQLList(GraphQLID),
      },
      'push': {
        type: GraphQLInt,
      },
      'pop': {
        type: GraphQLInt,
      },
      'slice': {
        type: GraphQLInt,
      },
    };
  },
});
