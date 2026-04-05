import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminCheckStatus = () => {
  const [grievances, setGrievances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState({ solved: 0, rejected: 0, processing: 0, reviewed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch from API instead of localStorage
        const allGrievances = await grievanceService.getAllGrievances();
        setGrievances(allGrievances);

        // Calculate stats from API data
        const newStats = allGrievances.reduce((acc, curr) => {
          const status = (curr.status || '').toLowerCase();
          if (status === 'resolved' || status === 'solved') acc.solved++;
          else if (status === 'rejected') acc.rejected++;
          else if (status === 'processing') acc.processing++;
          else if (status === 'in-progress' || status === 'in progress') acc.inProgress++;
          else acc.pending++;
          return acc;
        }, { solved: 0, rejected: 0, processing: 0, inProgress: 0, pending: 0 });

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching grievances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved' || s === 'solved') return 'bg-green-100 text-green-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    if (s === 'processing') return 'bg-blue-100 text-blue-700';
    if (s === 'in progress') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700'; // Pending
  };

  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = (g.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = statusFilter === 'all';
    if (!matchesStatus) {
      const s = (g.status || '').toLowerCase();
      if (statusFilter === 'solved') matchesStatus = (s === 'resolved' || s === 'solved');
      else if (statusFilter === 'rejected') matchesStatus = (s === 'rejected');
      else if (statusFilter === 'processing') matchesStatus = (s === 'processing');
      else if (statusFilter === 'reviewed') matchesStatus = (s === 'in progress');
    }

    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Check Status</h1>
        <p className="text-slate-500 mt-1 font-medium">Monitor and track the real-time status of all submitted grievances</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {[
          { label: 'Resolved', value: stats.solved, icon: 'fa-check-double', color: 'bg-green-100 text-green-600', gradient: 'from-green-50 to-white' },
          { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: 'bg-yellow-100 text-yellow-600', gradient: 'from-yellow-50 to-white' },
          { label: 'Processing', value: stats.processing, icon: 'fa-spinner', color: 'bg-blue-100 text-blue-600', gradient: 'from-blue-50 to-white' },
          { label: 'In-Progress', value: stats.inProgress, icon: 'fa-eye', color: 'bg-amber-100 text-amber-600', gradient: 'from-amber-50 to-white' },
          { label: 'Rejected', value: stats.rejected, icon: 'fa-times-circle', color: 'bg-red-100 text-red-600', gradient: 'from-red-50 to-white' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group`}>
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input
              type="text"
              placeholder="Search by Code/Email..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-600 appearance-none min-w-[180px] cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', icon: 'fa-list' },
            { id: 'solved', label: 'Solved', icon: 'fa-check', color: 'hover:text-green-600', activeClass: 'bg-white text-green-600 shadow-sm' },
            { id: 'rejected', label: 'Rejected', icon: 'fa-times', color: 'hover:text-red-600', activeClass: 'bg-white text-red-600 shadow-sm' },
            { id: 'processing', label: 'Processing', icon: 'fa-spinner', color: 'hover:text-blue-600', activeClass: 'bg-white text-blue-600 shadow-sm' },
            { id: 'reviewed', label: 'Reviewed', icon: 'fa-eye', color: 'hover:text-amber-600', activeClass: 'bg-white text-amber-600 shadow-sm' }
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status.id ? (status.activeClass || 'bg-white text-blue-600 shadow-sm') : `text-slate-500 ${status.color || 'hover:text-blue-600'}`
                }`}
            >
              <i className={`fas ${status.icon}`}></i> {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-800">Grievance Tracking List</h2>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            {filteredGrievances.length} Records Found
          </span>
        </div>

        {loading ? (
          <div className="px-8 py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="fas fa-spinner fa-spin text-slate-400 text-2xl"></i>
            </div>
            <p className="font-bold text-slate-800">Loading grievances...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grievance Code</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Date</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGrievances.length > 0 ? (
                filteredGrievances.map((g) => (
                  <tr key={g.code} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-blue-100">
                          #
                        </div>
                        <div>
                          <p className="font-black text-slate-900 font-mono tracking-tighter text-base">{g.code}</p>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{g.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{g.subject}</p>
                      <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">{g.email || 'Anonymous'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-bold text-slate-600">{new Date(g.submissionDate || g.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(g.status)}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/grievances/${g.code}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye text-sm"></i>
                        </Link>
                        <Link
                          to={`/admin/review/${g.code}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                          title="Review Case"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                      <i className="fas fa-database text-slate-200 text-2xl"></i>
                    </div>
                    <p className="font-bold text-slate-800">No records to display</p>
                    <p className="text-sm text-slate-400">Try changing your filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminCheckStatus;
