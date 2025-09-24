import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('slots', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('day_of_week').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.uuid('original_slot_id').nullable();
    table.foreign('original_slot_id').references('id').inTable('slots').onDelete('CASCADE');
    table.boolean('is_exception').defaultTo(false);
    table.date('exception_date').nullable();
    table.boolean('is_deleted').defaultTo(false);
    table.text('title').nullable();
    table.text('description').nullable();
    table.timestamps(true, true);
    
    table.index(['day_of_week']);
    table.index(['exception_date']);
    table.index(['original_slot_id']);
    table.index(['is_exception', 'is_deleted']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('slots');
}

