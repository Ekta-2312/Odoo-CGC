import { Knex } from 'knex';

/**
 * Create issues table with comprehensive schema for civic issue reporting
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('issues', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Issue details
    table.string('title', 500).notNullable();
    table.text('description').notNullable();
    table.string('category', 100).notNullable();
    
    // Status and workflow
    table.enum('status', ['pending', 'in-progress', 'resolved', 'rejected'])
         .defaultTo('pending').notNullable();
    
    // Location information
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.string('address', 500).notNullable();
    table.string('locality', 255).nullable(); // For nearby filtering
    
    // Reporter information
    table.uuid('reporter_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('reporter_name', 255).nullable(); // Stored for anonymous reports
    table.boolean('is_anonymous').defaultTo(false).notNullable();
    
    // Moderation and flags
    table.boolean('is_flagged').defaultTo(false).notNullable();
    table.boolean('is_hidden').defaultTo(false).notNullable(); // Auto-hidden if flagged too much
    table.integer('flag_count').defaultTo(0).notNullable();
    
    // Priority and admin fields
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.uuid('assigned_admin_id').references('id').inTable('users').nullable();
    table.text('admin_notes').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    table.timestamp('resolved_at').nullable();
    
    // Indexes for performance and spatial queries
    table.index(['status']);
    table.index(['category']);
    table.index(['reporter_id']);
    table.index(['is_flagged']);
    table.index(['is_hidden']);
    table.index(['created_at']);
    table.index(['latitude', 'longitude']); // For geospatial queries
    table.index(['locality']); // For nearby filtering
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('issues');
}
