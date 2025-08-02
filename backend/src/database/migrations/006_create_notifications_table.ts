import { Knex } from 'knex';

/**
 * Create notifications table for user notifications
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notifications', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Target user
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    // Notification content
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.enum('type', ['status_update', 'flag_result', 'system', 'admin_message'])
         .notNullable();
    
    // Related issue (if applicable)
    table.uuid('related_issue_id').references('id').inTable('issues').onDelete('CASCADE').nullable();
    
    // Notification status
    table.boolean('is_read').defaultTo(false).notNullable();
    table.boolean('is_email_sent').defaultTo(false).notNullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['is_read']);
    table.index(['type']);
    table.index(['created_at']);
    table.index(['related_issue_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notifications');
}
