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

exports.rollDice = ({ user, amount, target }) =>
  knex.transaction(async (trx) => {
    assert(target >= 0);
    assert(target < 99);
    assert(amount >= 0);

    let seed = null;
    let nonce = 0;

    while (!seed) {
      [seed] = await trx('seed').where('user', user);
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

      nonce = String(seed.nonce + 1);

      [seed] = await trx('seed')
        .where('user', user)
        .where('nonce', seed.nonce)
        .update({ nonce })
        .returning('*');
    }

    const hmac = crypto
      .createHmac('sha256', seed.secret)
      .update(nonce)
      .digest('hex');

    // we take the first 32 bits (4 bytes, 8 hex chars)
    const int = parseInt(hmac.substr(0, 8), 16);
    const float = int / 2 ** 32;

    const result = Math.floor(float * 100);
    const odds = (99 - target) / 100;
    const isWin = result > target;

    // 0.99 applies our house edge of 1%
    const payout = isWin ? (amount / odds) * 0.99 : 0;
    const [bet] = await trx('bet')
      .insert({
        id: uuid(),
        seed_id: seed.id,
        user,
        amount,
        payout,
        result,
        target,
        nonce,
      })
      .returning('*');

    await redis.publish('dice', JSON.stringify({ ...bet, game: 'dice' }));

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
