import React, { useState } from 'react';
import { FileText, Home, Settings, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Filter, Plus, MoreVertical, Calendar, Users, DollarSign, Bell, ChevronRight } from 'lucide-react';

export default function ContractManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const stats = [
    { label: 'Active Contracts', value: 12, change: '+2 this month', icon: CheckCircle, color: 'emerald' },
    { label: 'Pending Approval', value: 4, change: 'Review needed', icon: Clock, color: 'amber' },
    { label: 'Expiring Soon', value: 3, change: 'Within 30 days', icon: AlertCircle, color: 'red' },
    { label: 'Total Value', value: '$2.4M', change: '+12% from last quarter', icon: DollarSign, color: 'blue' }
  ];

  const contracts = [
    { id: 1, name: 'Master Service Agreement', party: 'ABC Corporation', status: 'Active', expiry: '12 Mar 2026', value: '$450K', progress: 65 },
    { id: 2, name: 'Non-Disclosure Agreement', party: 'Client A Inc.', status: 'Pending', expiry: '01 Nov 2025', value: '$0', progress: 30 },
    { id: 3, name: 'Employment Contract', party: 'John Doe', status: 'Expired', expiry: '30 Aug 2024', value: '$85K', progress: 100 },
    { id: 4, name: 'Vendor Partnership Agreement', party: 'XYZ Solutions', status: 'Active', expiry: '15 Jun 2026', value: '$280K', progress: 45 },
    { id: 5, name: 'Software License Agreement', party: 'Tech Corp Ltd', status: 'Active', expiry: '22 Dec 2025', value: '$125K', progress: 78 }
  ];

  const recentActivity = [
    { action: 'Contract signed', contract: 'Master Service Agreement', user: 'Sarah Johnson', time: '2 hours ago' },
    { action: 'Approval requested', contract: 'NDA – Client A', user: 'Mike Chen', time: '5 hours ago' },
    { action: 'Contract expired', contract: 'Employment Contract', user: 'System', time: '1 day ago' },
    { action: 'Document uploaded', contract: 'Vendor Partnership', user: 'Alex Kim', time: '2 days ago' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Expired': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Artifact</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'dashboard' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </button>
        
        <button
          onClick={() => setActiveTab('contracts')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'contracts' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          Contracts
        </button>
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'analytics' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Analytics
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">Need Help?</h4>
          <p className="text-xs text-gray-600 mb-3">Check our documentation and guides</p>
          <button className="w-full bg-white text-blue-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors border border-blue-200">
            View Docs
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts, parties, or documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            SJ
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="ml-64">
        <Header />
        
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your contracts.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <span className="text-xs text-gray-500">{stat.change}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contracts Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Contracts</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage and track all your agreements</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <Plus className="w-4 h-4" />
                    New Contract
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Party</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{contract.name}</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${contract.progress}%` }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {contract.party.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm text-gray-900">{contract.party}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{contract.value}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{contract.expiry}</td>
                        <td className="px-6 py-4">
                          <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600 mt-1">Latest updates and changes</p>
              </div>
              
              <div className="p-6 space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.contract}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <button className="w-full text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}