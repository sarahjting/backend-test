const uuid = require('uuid');
const { knex } = require('./knex');

exports.updateStatistic = async ({ user, game, amount, payout }) => {
  await knex.raw(
    `
      insert into statistic (
        "id", "user", "wagered", "profit"
      ) values (
        :id, :user, :wagered, :profit
      )
      on conflict ("user") do  update
      set 
      wagered = statistic.wagered + :wagered,
      profit = statistic.profit + :profit
    `,
    {
      id: uuid(),
      user,
      wagered: amount,
      profit: payout - amount,
    }
  );
  await knex.raw(
    `
      insert into game_statistic (
        "id", "user", "game", "wagered", "profit"
      ) values (
        :id, :user, :game, :wagered, :profit
      )
      on conflict ("user", "game") do  update
      set 
      wagered = game_statistic.wagered + :wagered,
      profit = game_statistic.profit + :profit
    `,
    {
      id: uuid(),
      user,
      game,
      wagered: amount,
      profit: payout - amount,
    }
  );
};

exports.getStatistic = async ({ user, game = null }) => {
  let statistic;
  if (game) {
    [statistic] = await knex('game_statistic')
      .where('user', user)
      .where('game', game);
  } else {
    [statistic] = await knex('statistic').where('user', user);
  }
  return statistic;
};
