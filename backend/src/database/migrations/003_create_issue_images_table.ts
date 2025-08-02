import { Knex } from 'knex';

/**
 * Create issue_images table for storing multiple images per issue
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('issue_images', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign key to issues
    table.uuid('issue_id').references('id').inTable('issues').onDelete('CASCADE').notNullable();
    
    // Image information
    table.string('filename', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.integer('file_size').notNullable(); // in bytes
    table.string('file_path', 500).notNullable();
    table.string('thumbnail_path', 500).nullable();
    
    // Image metadata
    table.integer('width').nullable();
    table.integer('height').nullable();
    table.integer('display_order').defaultTo(0); // For ordering images
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['issue_id']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('issue_images');
}
