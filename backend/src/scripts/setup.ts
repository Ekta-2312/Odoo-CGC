import dotenv from 'dotenv';
import { seedDatabase, getDatabaseStats } from '../utils/seedData';
import database from '../config/database';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('🚀 CivicTrack Database Setup');
    console.log('============================');
    
    // Seed the database
    await seedDatabase();
    
    // Display statistics
    console.log('\n📊 Database Statistics:');
    const stats = await getDatabaseStats();
    console.log(`Users: ${stats.users}`);
    console.log(`Issues: ${stats.issues}`);
    console.log(`Comments: ${stats.comments}`);
    
    console.log('\n📋 Issues by Category:');
    stats.categories.forEach((cat: any) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });
    
    console.log('\n🔄 Issues by Status:');
    stats.statuses.forEach((status: any) => {
      console.log(`  ${status._id}: ${status.count}`);
    });
    
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

export default main;
