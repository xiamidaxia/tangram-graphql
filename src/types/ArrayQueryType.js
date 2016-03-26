import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'ArrayQuery',
  fields: () => {
    return {
      'size': {
        type: GraphQLInt,
      },
      'in': {
        type: new GraphQLList(GraphQLID),
      },
      'nin': {
        type: new GraphQLList(GraphQLID),
      },
    };
  },
});
