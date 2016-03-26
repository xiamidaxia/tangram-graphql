import {
  GraphQLInputObjectType,
  GraphQLFloat,
} from 'graphql';

export default new GraphQLInputObjectType({
  name: 'NumberInput',
  fields: () => {
    return {
      inc: {
        type: GraphQLFloat,
      },
    };
  },
});
