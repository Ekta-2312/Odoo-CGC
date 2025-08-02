import { Knex } from 'knex';

/**
 * Create issue_flags table to track who flagged which issues
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('issue_flags', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign keys
    table.uuid('issue_id').references('id').inTable('issues').onDelete('CASCADE').notNullable();
    table.uuid('flagger_user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    // Flag information
    table.string('reason', 255).nullable(); // Why was it flagged
    table.text('description').nullable(); // Additional details
    
    // Status of the flag
    table.enum('status', ['pending', 'reviewed', 'dismissed']).defaultTo('pending');
    table.uuid('reviewed_by_admin_id').references('id').inTable('users').nullable();
    table.text('admin_decision_note').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    table.timestamp('reviewed_at').nullable();
    
    // Ensure a user can only flag an issue once
    table.unique(['issue_id', 'flagger_user_id']);
    
    // Indexes
    table.index(['issue_id']);
    table.index(['flagger_user_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('issue_flags');
}
