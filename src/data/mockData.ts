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
    assignedAdminId: undefined,
    adminNotes: '',
    isHidden: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    statusHistory: [
      {
        id: '1',
        status: 'pending',
        timestamp: '2024-01-15T10:30:00Z',
        updatedBy: 'John Doe'
      }
    ]
  },
  {
    id: '2',
    title: 'Broken Streetlight',
    description: 'Streetlight has been out for over a week on Elm Street. Creates safety concerns for pedestrians.',
    category: 'Lighting',
    status: 'in-progress',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: '456 Elm Street, City, State'
    },
    images: [],
    reporterId: '2',
    reporterName: 'Jane Smith',
    isAnonymous: false,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'high',
    assignedAdminId: 'admin1',
    adminNotes: 'Repair crew dispatched',
    isHidden: false,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    statusHistory: [
      {
        id: '2',
        status: 'pending',
        timestamp: '2024-01-10T14:20:00Z',
        updatedBy: 'Jane Smith'
      },
      {
        id: '3',
        status: 'in-progress',
        timestamp: '2024-01-12T09:15:00Z',
        updatedBy: 'Admin User'
      }
    ]
  },
  {
    id: '3',
    title: 'Graffiti on Public Building',
    description: 'Offensive graffiti on the side of the library building. Needs immediate attention.',
    category: 'Vandalism',
    status: 'resolved',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '789 Library Ave, City, State'
    },
    images: [],
    reporterId: '3',
    reporterName: 'Anonymous',
    isAnonymous: true,
    isFlagged: false,
    flaggedBy: [],
    flagCount: 0,
    priority: 'medium',
    assignedAdminId: 'admin2',
    adminNotes: 'Cleaned and painted over',
    isHidden: false,
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-01-08T16:30:00Z',
    resolvedAt: '2024-01-08T16:30:00Z',
    statusHistory: [
      {
        id: '4',
        status: 'pending',
        timestamp: '2024-01-05T08:45:00Z',
        updatedBy: 'Anonymous'
      },
      {
        id: '5',
        status: 'in-progress',
        timestamp: '2024-01-06T10:00:00Z',
        updatedBy: 'Admin User'
      },
      {
        id: '6',
        status: 'resolved',
        timestamp: '2024-01-08T16:30:00Z',
        updatedBy: 'Admin User',
        comment: 'Graffiti removed and area repainted'
      }
    ]
  }
];

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  reported: 'bg-gray-100 text-gray-800 border-gray-200',
  in_review: 'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export const categoryLabels = {
  'Roads': 'Roads & Infrastructure',
  'Lighting': 'Street Lighting',
  'Vandalism': 'Vandalism & Graffiti',
  'Waste': 'Waste Management',
  'Parks': 'Parks & Recreation',
  'Traffic': 'Traffic & Parking',
  'Utilities': 'Utilities',
  'Safety': 'Public Safety',
  'Other': 'Other Issues'
};
