import { Issue } from '../types';

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing damage to vehicles. Located near the intersection with Oak Avenue.',
    category: 'Roads',
    status: 'pending',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main Street, City, State'
    },
    images: [
      'https://images.pexels.com/photos/1097491/pexels-photo-1097491.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    reporterId: '1',
    reporterName: 'John Doe',
    isAnonymous: false,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'medium',
    isHidden: false,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    statusHistory: [
      {
        id: '1',
        status: 'pending',
        timestamp: '2024-01-20T10:30:00Z',
        updatedBy: 'System'
      }
    ]
  },
  {
    id: '2',
    title: 'Broken Street Light',
    description: 'Street light has been out for over a week. Area is very dark at night.',
    category: 'Lighting',
    status: 'in-progress',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Park Avenue, City, State'
    },
    images: [
      'https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    reporterId: '1',
    isAnonymous: true,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'high',
    isHidden: false,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
    statusHistory: [
      {
        id: '2',
        status: 'pending',
        timestamp: '2024-01-18T14:20:00Z',
        updatedBy: 'System'
      },
      {
        id: '3',
        status: 'in-progress',
        timestamp: '2024-01-21T09:15:00Z',
        updatedBy: 'Admin User'
      }
    ]
  },
  {
    id: '3',
    title: 'Water Leak on Elm Street',
    description: 'Continuous water leak from underground pipe. Water is flooding the sidewalk.',
    category: 'Water',
    status: 'resolved',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: '789 Elm Street, City, State'
    },
    images: [
      'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    reporterId: '1',
    reporterName: 'John Doe',
    isAnonymous: false,
    isFlagged: true,
    flaggedBy: ['2'],
    flagCount: 1,
    priority: 'urgent',
    isHidden: false,
    createdAt: '2024-01-15T08:45:00Z',
    updatedAt: '2024-01-22T16:30:00Z',
    resolvedAt: '2024-01-22T16:30:00Z',
    statusHistory: [
      {
        id: '4',
        status: 'pending',
        timestamp: '2024-01-15T08:45:00Z',
        updatedBy: 'System'
      },
      {
        id: '5',
        status: 'in-progress',
        timestamp: '2024-01-16T10:00:00Z',
        updatedBy: 'Admin User'
      },
      {
        id: '6',
        status: 'resolved',
        timestamp: '2024-01-22T16:30:00Z',
        updatedBy: 'Admin User'
      }
    ]
  },
  {
    id: '4',
    title: 'Overflowing Garbage Bin',
    description: 'The garbage bin at the park entrance has been overflowing for days. It\'s attracting pests and creating a bad smell.',
    category: 'Waste Management',
    status: 'pending',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: 'Central Park Entrance, City, State'
    },
    images: [
      'https://images.pexels.com/photos/3738673/pexels-photo-3738673.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    reporterId: '2',
    reporterName: 'Jane Smith',
    isAnonymous: false,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'medium',
    isHidden: false,
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-25T09:15:00Z',
    statusHistory: [
      {
        id: '7',
        status: 'pending',
        timestamp: '2024-01-25T09:15:00Z',
        updatedBy: 'System'
      }
    ]
  },
  {
    id: '5',
    title: 'Broken Playground Equipment',
    description: 'The swing set at Roosevelt Park has a broken chain. It could be dangerous for children.',
    category: 'Parks & Recreation',
    status: 'in-progress',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: 'Roosevelt Park, City, State'
    },
    images: [],
    reporterId: '1',
    isAnonymous: true,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'high',
    isHidden: false,
    createdAt: '2024-01-23T16:30:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
    statusHistory: [
      {
        id: '8',
        status: 'pending',
        timestamp: '2024-01-23T16:30:00Z',
        updatedBy: 'System'
      },
      {
        id: '9',
        status: 'in-progress',
        timestamp: '2024-01-24T10:00:00Z',
        updatedBy: 'Admin User',
        comment: 'Maintenance team has been notified and will fix this by end of week.'
      }
    ]
  }
];

export const categories = [
  'infrastructure',
  'environment', 
  'safety',
  'utilities',
  'transportation',
  'housing',
  'health',
  'education',
  'other'
];

// Display labels for better UX
export const categoryLabels = {
  'infrastructure': 'Infrastructure & Roads',
  'environment': 'Environment & Waste',
  'safety': 'Public Safety',
  'utilities': 'Utilities & Lighting',
  'transportation': 'Transportation',
  'housing': 'Housing',
  'health': 'Health Services',
  'education': 'Education',
  'other': 'Other'
};

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};