const _ = require('lodash');
const crypto = require('crypto');
const uuid = require('uuid');
const assert = require('assert');
const { knex } = require('./knex');
const { redis } = require('./redis');

const parseSeed = (seed) => {
  if (!seed) {
    return null;
  }

  if (seed.active) {
    return _.omit(seed, ['secret']);
  }

  return seed;
};

exports.spinWheel = ({ user, amount }) =>
  knex.transaction(async (trx) => {
    assert(amount >= 0);

    let [seed] = await trx('seed').where('user', user);
    if (!seed) {
      const secret = crypto.randomBytes(32).toString('hex');
      const hash = crypto
        .createHash('sha256')
        .update(secret)
        .digest('hex');

      [seed] = await trx('seed')
        .insert({ id: uuid(), user, secret, hash, nonce: 0, active: true })
        .returning('*');
    }

    [seed] = await trx('seed')
      .where('user', user)
      .update({ nonce: knex.raw('nonce + 1') })
      .returning('*');
    const nonce = String(seed.nonce);

    const hmac = crypto
      .createHmac('sha256', seed.secret)
      .update(nonce)
      .digest('hex');

    const segments = [1.5, 0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 0];

    // we take the first 32 bits (4 bytes, 8 hex chars)
    const int = parseInt(hmac.substr(0, 8), 16);
    const float = int / 2 ** 32;

    const result = Math.floor(float * segments.length);

    const payout = amount * segments[result];
    const [bet] = await trx('bet')
      .insert({
        id: uuid(),
        seed_id: seed.id,
        user,
        amount,
        payout,
        result,
        nonce,
      })
      .returning('*');

    await redis.publish('wheel', JSON.stringify({ ...bet, game: 'wheel' }));

    return bet;
  });

exports.getBets = async ({ user, limit, offset }) => {
  const bets = await knex('bet')
    .where('user', user)
    .orderBy('bet.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return bets;
};

exports.getSeed = async ({ seedId }) => {
  const [seed] = await knex('seed').where('id', seedId);
  return parseSeed(seed);
};

exports.rotateSeed = async ({ user }) => {
  const [seed] = await knex('seed')
    .update({ active: false })
    .where({ user, active: true })
    .returning('*');

  return parseSeed(seed);
};

exports.getActiveSeed = async ({ user }) => {
  const [seed] = await knex('seed').where({ user, active: true });
  return parseSeed(seed);
};
