import { User } from '../models/User';
import { Issue } from '../models/Issue';
import { Comment } from '../models/index';
import database from '../config/database';

/**
 * Sample Data for CivicTrack
 */
export const sampleData = {
  users: [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'user' as const,
      isVerified: true,
      defaultLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, New York, NY 10001'
      }
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '2345678901',
      password: 'password123',
      role: 'user' as const,
      isVerified: true,
      defaultLocation: {
        latitude: 40.7580,
        longitude: -73.9855,
        address: '456 Park Ave, New York, NY 10022'
      }
    },
    {
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      phone: '3456789012',
      password: 'password123',
      role: 'user' as const,
      isVerified: true,
      defaultLocation: {
        latitude: 40.7831,
        longitude: -73.9712,
        address: '789 Broadway, New York, NY 10003'
      }
    },
    {
      name: 'Admin User',
      email: 'admin@civictrack.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin' as const,
      isVerified: true,
      defaultLocation: {
        latitude: 22.554029,
        longitude: 72.948936,
        address: 'Anand City Center, District Headquarters, Anand, Gujarat'
      }
    }
  ],
  
  issues: [
    {
      title: 'CHARUSAT Campus Pond - Water Quality Concerns',
      description: 'The campus pond at CHARUSAT has developed algae growth and water quality issues. Students and faculty have reported foul odor and discoloration of water. This affects the campus environment and may pose health risks. The pond needs immediate cleaning and water treatment.',
      category: 'environment' as const,
      priority: 'high' as const,
      location: {
        latitude: 22.59806,
        longitude: 72.82000,
        address: 'CHARUSAT Campus Pond, Changa, Anand District, Gujarat',
        district: 'Anand',
        ward: 'Changa'
      },
      images: [
        '/uploads/images-1754118580135-302734746.JPG',
        '/uploads/images-1754120544246-873389425.jpeg'
      ],
      tags: ['water-quality', 'environment', 'campus'],
      views: 89,
      isPublic: true
    },
    {
      title: 'SPU Campus - Broken Streetlights on Main Road',
      description: 'Multiple streetlights along the main road at Sardar Patel University campus are not functioning. This creates safety concerns for students walking at night between hostels and academic buildings. The lighting infrastructure needs urgent repair to ensure student safety.',
      category: 'safety' as const,
      priority: 'high' as const,
      location: {
        latitude: 22.554832,
        longitude: 72.924866,
        address: 'Sardar Patel University, Vallabh Vidyanagar, Anand District, Gujarat',
        district: 'Anand',
        ward: 'Vallabh Vidyanagar'
      },
      images: [
        '/uploads/images-1754120562617-748197882.jpeg',
        '/uploads/images-1754121392703-721413137.JPG'
      ],
      tags: ['lighting', 'safety', 'university'],
      views: 156,
      isPublic: true
    },
    {
      title: 'Anand City Center - Traffic Congestion and Poor Road Conditions',
      description: 'The main road at Anand City Center experiences severe traffic congestion during peak hours. Additionally, multiple potholes and uneven road surfaces are causing vehicle damage and safety hazards. The district headquarters area needs better traffic management and road repairs.',
      category: 'transportation' as const,
      priority: 'medium' as const,
      location: {
        latitude: 22.554029,
        longitude: 72.948936,
        address: 'Anand City Center, District Headquarters, Anand, Gujarat',
        district: 'Anand',
        ward: 'City Center'
      },
      images: [
        '/uploads/images-1754124292835-243869541.JPG',
        '/uploads/images-1754125035579-902258482.JPG'
      ],
      tags: ['traffic', 'infrastructure', 'city-center'],
      views: 203,
      isPublic: true
    },
    {
      title: 'Pothole on Main Street causing traffic delays',
      description: 'Large pothole at the intersection of Main Street and 5th Avenue is causing significant traffic delays and potential vehicle damage. The hole is approximately 3 feet wide and 1 foot deep. Multiple vehicles have been seen swerving to avoid it, creating dangerous driving conditions.',
      category: 'infrastructure' as const,
      priority: 'high' as const,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St & 5th Ave, New York, NY 10001',
        district: 'Manhattan',
        ward: 'Ward 1'
      },
      images: [
        'https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Pothole.jpg',
        'https://via.placeholder.com/800x600/4ecdc4/ffffff?text=Road+Damage.jpg'
      ],
      tags: ['traffic', 'safety', 'road-damage'],
      views: 156,
      isPublic: true
    },
    {
      title: 'Broken streetlight creating safety hazard',
      description: 'The streetlight at the corner of Oak Street and Pine Avenue has been non-functional for over two weeks. This area is poorly lit at night, creating safety concerns for pedestrians and increasing the risk of accidents. Local residents have reported feeling unsafe walking in this area after dark.',
      category: 'safety' as const,
      priority: 'medium' as const,
      location: {
        latitude: 40.7580,
        longitude: -73.9855,
        address: 'Oak St & Pine Ave, New York, NY 10022',
        district: 'Manhattan',
        ward: 'Ward 2'
      },
      images: [
        'https://via.placeholder.com/800x600/ffd93d/333333?text=Broken+Light.jpg'
      ],
      tags: ['lighting', 'safety', 'pedestrian'],
      views: 89,
      isPublic: true
    },
    {
      title: 'Illegal dumping in Central Park area',
      description: 'Large amounts of construction debris and household waste have been illegally dumped near the north entrance of Central Park. The waste includes old furniture, construction materials, and what appears to be hazardous materials. This is creating an eyesore and potential environmental hazard.',
      category: 'environment' as const,
      priority: 'high' as const,
      location: {
        latitude: 40.7831,
        longitude: -73.9712,
        address: 'Central Park North Entrance, New York, NY 10025',
        district: 'Manhattan',
        ward: 'Ward 3'
      },
      images: [
        'https://via.placeholder.com/800x600/6c5ce7/ffffff?text=Garbage+Issue.jpg',
        'https://via.placeholder.com/800x600/a29bfe/ffffff?text=Waste+Problem.jpg'
      ],
      tags: ['illegal-dumping', 'environment', 'waste'],
      views: 234,
      isPublic: true
    },
    {
      title: 'Water main break flooding residential street',
      description: 'A major water main break on Elm Street has resulted in significant flooding of the roadway and several residential properties. Water is gushing from underground and has made the street impassable. Several residents have reported water damage to their basements.',
      category: 'utilities' as const,
      priority: 'critical' as const,
      location: {
        latitude: 40.7505,
        longitude: -73.9934,
        address: '567 Elm Street, New York, NY 10018',
        district: 'Manhattan',
        ward: 'Ward 4'
      },
      images: [
        'https://via.placeholder.com/800x600/fd79a8/ffffff?text=Water+Main.jpg'
      ],
      tags: ['water', 'flooding', 'emergency'],
      views: 445,
      isPublic: true
    },
    {
      title: 'Damaged bus stop shelter needs repair',
      description: 'The bus stop shelter on Madison Avenue has significant damage from recent storms. The roof is partially collapsed, and broken glass is scattered around the area. Commuters are unable to use the shelter for protection from weather, and the broken glass poses a safety risk.',
      category: 'transportation' as const,
      priority: 'medium' as const,
      location: {
        latitude: 40.7614,
        longitude: -73.9776,
        address: '890 Madison Avenue, New York, NY 10065',
        district: 'Manhattan',
        ward: 'Ward 5'
      },
      images: [
        'https://via.placeholder.com/800x600/00b894/ffffff?text=Noise+Issue.jpg'
      ],
      tags: ['public-transport', 'shelter', 'weather-damage'],
      views: 67,
      isPublic: true
    },
    {
      title: 'Playground equipment safety concerns',
      description: 'Several pieces of playground equipment at Washington Square Park show signs of wear and potential safety hazards. The swing set has loose chains, the slide has sharp edges, and the climbing structure has loose bolts. Children could be injured if these issues are not addressed promptly.',
      category: 'safety' as const,
      priority: 'high' as const,
      location: {
        latitude: 40.7308,
        longitude: -73.9973,
        address: 'Washington Square Park, New York, NY 10012',
        district: 'Manhattan',
        ward: 'Ward 6'
      },
      images: [
        'https://via.placeholder.com/800x600/e17055/ffffff?text=Graffiti.jpg',
        'https://via.placeholder.com/800x600/fdcb6e/333333?text=Vandalism.jpg'
      ],
      tags: ['playground', 'children', 'equipment'],
      views: 123,
      isPublic: true
    },
    {
      title: 'Overgrown vegetation blocking sidewalk',
      description: 'Trees and bushes along Riverside Drive have grown to block most of the sidewalk, forcing pedestrians to walk in the street. The overgrown vegetation also blocks street signs and reduces visibility for drivers. This creates a safety hazard for both pedestrians and vehicles.',
      category: 'environment' as const,
      priority: 'medium' as const,
      location: {
        latitude: 40.7892,
        longitude: -73.9442,
        address: '1234 Riverside Drive, New York, NY 10025',
        district: 'Manhattan',
        ward: 'Ward 7'
      },
      images: [
        'https://via.placeholder.com/800x600/81ecec/333333?text=Park+Issue.jpg'
      ],
      tags: ['vegetation', 'sidewalk', 'maintenance'],
      views: 78,
      isPublic: true
    },
    {
      title: 'Graffiti vandalism on public building',
      description: 'The exterior walls of the public library on 42nd Street have been extensively vandalized with graffiti. While some may consider it art, the unauthorized markings are covering important building signage and creating a negative impression of the area.',
      category: 'other' as const,
      priority: 'low' as const,
      location: {
        latitude: 40.7539,
        longitude: -73.9820,
        address: '476 42nd Street, New York, NY 10018',
        district: 'Manhattan',
        ward: 'Ward 8'
      },
      images: [
        'https://via.placeholder.com/800x600/fab1a0/333333?text=Crosswalk.jpg'
      ],
      tags: ['vandalism', 'graffiti', 'public-property'],
      views: 45,
      isPublic: true
    }
  ]
};

/**
 * Seed the database with sample data
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await database.connect();
    
    // Clear existing data (optional - remove in production)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Comment.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleData.users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }
    
    // Create issues
    console.log('📋 Creating issues...');
    for (let i = 0; i < sampleData.issues.length; i++) {
      const issueData = sampleData.issues[i];
      const randomUser = createdUsers[Math.floor(Math.random() * (createdUsers.length - 1))]; // Exclude admin
      
      if (!randomUser) continue;
      
      const issue = new Issue({
        ...issueData,
        reportedBy: randomUser._id,
        upvotes: [
          createdUsers[Math.floor(Math.random() * createdUsers.length)]?._id,
          createdUsers[Math.floor(Math.random() * createdUsers.length)]?._id
        ].filter(id => id).slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 random upvotes
      });
      
      await issue.save();
      console.log(`✅ Created issue: ${issue.title.substring(0, 50)}...`);
      
      // Add some random comments
      if (Math.random() > 0.5) {
        const commentUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (commentUser) {
          const comment = new Comment({
            issueId: issue._id,
            userId: commentUser._id,
            content: 'This is a serious issue that needs immediate attention. I hope the authorities take action soon.',
            isOfficial: commentUser.role === 'admin'
          });
          await comment.save();
        }
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${sampleData.issues.length} issues`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Get statistics about the current data
 */
export async function getDatabaseStats() {
  try {
    const userCount = await User.countDocuments();
    const issueCount = await Issue.countDocuments();
    const commentCount = await Comment.countDocuments();
    
    const issuesByCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    return {
      users: userCount,
      issues: issueCount,
      comments: commentCount,
      categories: issuesByCategory,
      statuses: issuesByStatus
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
}
