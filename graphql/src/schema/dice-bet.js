const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString
} = require('graphql');
const User = require('./user');
const Seed = require('./seed');

exports.Type = new GraphQLObjectType({
  name: 'DiceBet',
  fields: () => ({
    id: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    payout: { type: GraphQLFloat },
    target: { type: GraphQLInt },
    result: { type: GraphQLInt },
    nonce: { type: GraphQLInt },
    user: {
      type: User.Type,
      resolve: ({ user }) => ({ name: user })
    },
    seed: {
      type: Seed.Type,
      resolve: ({ seed_id: seedId }, _, { loaders }) =>
        loaders.diceSeedLoader.load(seedId)
    }
  })
});
