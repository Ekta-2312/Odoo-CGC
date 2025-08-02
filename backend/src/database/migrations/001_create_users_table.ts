import { Knex } from 'knex';

/**
 * Create users table with proper indexing and constraints
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // User information
    table.string('name', 255).notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('phone', 20).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    
    // Role and status
    table.enum('role', ['user', 'admin']).defaultTo('user').notNullable();
    table.boolean('is_banned').defaultTo(false).notNullable();
    table.boolean('is_verified').defaultTo(false).notNullable();
    
    // Security and session management
    table.string('verification_token', 255).nullable();
    table.string('reset_password_token', 255).nullable();
    table.timestamp('reset_password_expires').nullable();
    table.timestamp('last_login').nullable();
    
    // Location preferences (for nearby issues)
    table.decimal('default_lat', 10, 8).nullable();
    table.decimal('default_lng', 11, 8).nullable();
    table.integer('preferred_radius_km').defaultTo(5);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['email']);
    table.index(['phone']);
    table.index(['role']);
    table.index(['is_banned']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
