import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import apiService from '../../services/api';
import { Shield, Ban, CheckCircle, AlertTriangle, Search, Filter, Calendar, MapPin } from 'lucide-react';

const UserManagementAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterStatus]); // Refetch when filters change

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: Record<string, string> = {
        page: '1',
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (searchTerm && searchTerm !== '') {
        params.search = searchTerm;
      }
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await apiService.get<{ 
        data: User[], 
        total: number, 
        page: number, 
        pages: number 
      }>('/admin/users', params);
      
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await apiService.patch(`/admin/users/${userId}/ban`, { isBanned });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isBanned } : user
      ));
    } catch (error: any) {
      console.error('Error updating user ban status:', error);
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try {
      await apiService.patch(`/admin/users/${userId}/role`, { role });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role } : user
      ));
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'banned' && user.isBanned) ||
                         (filterStatus === 'active' && !user.isBanned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserId = (user: User): string => {
    return user._id || user.id || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage user accounts, permissions, and moderation actions.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Total Users: {users.length}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                  <button
                    onClick={fetchUsers}
                    className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin')}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={getUserId(user)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          {user.defaultLocation?.address && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {user.defaultLocation.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(getUserId(user), e.target.value as 'user' | 'admin')}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isBanned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(user.createdAt || '').toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.isBanned ? (
                          <button
                            onClick={() => handleBanUser(getUserId(user), false)}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs hover:bg-green-200 transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(getUserId(user), true)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs hover:bg-red-200 transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No users found</div>
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? (
                <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
              ) : (
                <p className="text-gray-400 mt-2">No users have registered yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementAdmin;
