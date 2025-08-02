import { Knex } from 'knex';

/**
 * Create status_history table to track issue status changes
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('status_history', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign key to issues
    table.uuid('issue_id').references('id').inTable('issues').onDelete('CASCADE').notNullable();
    
    // Status change information
    table.string('from_status', 50).nullable(); // null for initial status
    table.string('to_status', 50).notNullable();
    table.text('comment').nullable(); // Admin comment for status change
    
    // Who made the change
    table.uuid('changed_by_user_id').references('id').inTable('users').nullable();
    table.string('changed_by_name', 255).nullable(); // For system changes
    
    // Timestamps
    table.timestamp('changed_at').defaultTo(knex.fn.now()).notNullable();
    
    // Indexes
    table.index(['issue_id']);
    table.index(['changed_at']);
    table.index(['to_status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('status_history');
}
