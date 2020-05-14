exports.up = async (knex) => {
  await knex.schema.createTable('game_statistic', (table) => {
    table.uuid('id').primary();

    table.string('user').notNull();
    table.enum('game', ['dice', 'wheel']).notNull();

    table.float('wagered').notNull();
    table.float('profit').notNull();

    table.unique(['user', 'game']);
  });
};

exports.down = async () => {};
