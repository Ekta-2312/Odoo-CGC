import React from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  rejectedIssues: number;
  thisWeekIssues: number;
  lastWeekIssues: number;
  averageResolutionTime: number;
  mostCommonCategory: string;
  resolutionRate: number;
}

interface DashboardAnalyticsProps {
  data: AnalyticsData;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ data }) => {
  const weeklyChange = data.thisWeekIssues - data.lastWeekIssues;
  const weeklyChangePercent = data.lastWeekIssues > 0 
    ? Math.round((weeklyChange / data.lastWeekIssues) * 100) 
    : 0;

  const stats = [
    {
      title: 'Total Reports',
      value: data.totalIssues,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Pending',
      value: data.pendingIssues,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Resolved',
      value: data.resolvedIssues,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Resolution Rate',
      value: `${data.resolutionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg ${stat.bgColor.replace('50', '100')}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">This Week</h3>
            <div className={`flex items-center text-sm ${
              weeklyChange >= 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {weeklyChange >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(weeklyChangePercent)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.thisWeekIssues}</p>
          <p className="text-xs text-gray-500 mt-1">
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange} from last week
          </p>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Avg. Resolution</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.averageResolutionTime}</p>
          <p className="text-xs text-gray-500 mt-1">days average</p>
        </div>

        {/* Most Common Category */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Top Category</h3>
            <AlertTriangle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-900 capitalize">{data.mostCommonCategory}</p>
          <p className="text-xs text-gray-500 mt-1">most reported</p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Status Distribution</h3>
        <div className="space-y-3">
          {[
            { label: 'Pending', value: data.pendingIssues, color: 'bg-yellow-500', total: data.totalIssues },
            { label: 'In Progress', value: data.inProgressIssues, color: 'bg-blue-500', total: data.totalIssues },
            { label: 'Resolved', value: data.resolvedIssues, color: 'bg-green-500', total: data.totalIssues },
            { label: 'Rejected', value: data.rejectedIssues, color: 'bg-red-500', total: data.totalIssues }
          ].map((item, index) => {
            const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-900 font-medium">{item.value}</span>
                  <span className="text-gray-500">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
