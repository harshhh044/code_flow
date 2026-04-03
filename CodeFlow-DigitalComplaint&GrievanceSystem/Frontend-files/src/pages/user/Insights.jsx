import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import grievanceService from '../../services/grievanceService';

const UserInsights = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('Month');

  // ✅ Fetch from backend
  useEffect(() => {
    const fetchGrievances = async () => {
      if (!user) return;
      try {
        const data = await grievanceService.getUserGrievances(user);
        setGrievances(data);
      } catch (err) {
        console.error('[Insights] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, [user]);

  const total = grievances.length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;
  const pending = grievances.filter(g => g.status === 'Pending').length;
  const inProgress = grievances.filter(g => ['In Progress', 'Active', 'Assigned'].includes(g.status)).length;
  const rejected = grievances.filter(g => ['Rejected', 'Closed'].includes(g.status)).length;
  const highPriority = grievances.filter(g => ['High', 'Urgent'].includes(g.priority)).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const calculateTrends = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentCount = grievances.filter(g => new Date(g.createdAt || g.submissionDate).getMonth() === currentMonth).length;
    const prevCount = grievances.filter(g => new Date(g.createdAt || g.submissionDate).getMonth() === prevMonth).length;
    let diff = prevCount > 0 ? Math.round(((currentCount - prevCount) / prevCount) * 100) : currentCount > 0 ? 100 : 0;
    return { val: Math.abs(diff), up: diff >= 0 };
  };
  const monthTrend = calculateTrends();

  const handleExportCSV = () => {
    if (!grievances.length) return;
    const headers = ['Code', 'Category', 'Subject', 'Status', 'Priority', 'Date'];
    const rows = grievances.map(g => [
      `"${g.code}"`, `"${g.category}"`, `"${(g.subject || g.title || '').replace(/"/g, '""')}"`,
      `"${g.status}"`, `"${g.priority || 'Normal'}"`, `"${new Date(g.createdAt || g.submissionDate).toLocaleDateString()}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Grievance_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  // Category breakdown
  const categoryCounts = {};
  grievances.forEach(g => { categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1; });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Monthly data
  const monthlyData = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData[d.toLocaleString('default', { month: 'short' })] = 0;
  }
  grievances.forEach(g => {
    const key = new Date(g.createdAt || g.submissionDate).toLocaleString('default', { month: 'short' });
    if (monthlyData[key] !== undefined) monthlyData[key]++;
  });
  const maxMonthly = Math.max(...Object.values(monthlyData), 1);

  const insightCards = [
    { icon: 'fa-file-alt', label: 'Total Files', value: total, color: 'blue', trend: monthTrend },
    { icon: 'fa-check-circle', label: 'Resolved', value: resolved, color: 'green', trend: { val: 8, up: true } },
    { icon: 'fa-exclamation-triangle', label: 'High Priority', value: highPriority, color: 'red', trend: { val: 2, up: false } },
    { icon: 'fa-spinner', label: 'In Progress', value: inProgress, color: 'purple', trend: { val: 4, up: true } },
    { icon: 'fa-clock', label: 'Pending', value: pending, color: 'orange', trend: { val: 0, up: false } },
    { icon: 'fa-chart-line', label: 'Success Rate', value: `${resolutionRate}%`, color: 'teal', trend: { val: 5, up: true } },
  ];

  const colorMap = {
    blue: { iconBg: 'bg-blue-600', iconText: 'text-white' },
    green: { iconBg: 'bg-emerald-500', iconText: 'text-white' },
    orange: { iconBg: 'bg-orange-500', iconText: 'text-white' },
    purple: { iconBg: 'bg-purple-600', iconText: 'text-white' },
    red: { iconBg: 'bg-red-500', iconText: 'text-white' },
    teal: { iconBg: 'bg-teal-500', iconText: 'text-white' },
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div></div>;

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">My Analytics</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Performance Tracking Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <i className="fas fa-print"></i> Generate Report
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg">
            <i className="fas fa-download"></i> Export Dataset
          </button>
        </div>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border-dashed border-2 border-slate-200">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <i className="fas fa-layer-group text-5xl text-blue-300"></i>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4">No Insights Available</h3>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Submit your first grievance to see analytics here.</p>
          <Link to="/user/submit" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm hover:shadow-2xl hover:bg-blue-600 transition-all">
            Submit New Grievance <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
            {insightCards.map((card, i) => (
              <div key={i} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${colorMap[card.color].iconBg} ${colorMap[card.color].iconText}`}>
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${card.trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <i className={`fas fa-caret-${card.trend.up ? 'up' : 'down'}`}></i>
                    {card.trend.val}%
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{card.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Charts */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                  <h2 className="text-2xl font-black text-slate-900">Status Lifecycle</h2>
                  <div className="flex p-1 bg-slate-50 rounded-2xl">
                    {['Week', 'Month', 'Year'].map(t => (
                      <button key={t} onClick={() => setTimeframe(t)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                  {[
                    { label: 'Resolved', count: resolved, color: '#10B981', icon: 'fa-check-double' },
                    { label: 'Pending', count: pending, color: '#F59E0B', icon: 'fa-hourglass-half' },
                    { label: 'Reviewing', count: inProgress, color: '#3B82F6', icon: 'fa-sync-alt' },
                    { label: 'Closed', count: rejected, color: '#EF4444', icon: 'fa-times-circle' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-4">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="white" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke={item.color} strokeWidth="3.5"
                            strokeDasharray={`${total > 0 ? (item.count / total) * 100 : 0} 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-slate-900">{item.count}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <div className="pt-8 border-t border-slate-50">
                  <div className="flex items-end justify-between h-48 gap-4 px-2">
                    {Object.entries(monthlyData).map(([month, count]) => (
                      <div key={month} className="flex-1 flex flex-col items-center group relative">
                        <div className="w-full max-w-[32px] bg-gradient-to-t from-slate-900 to-slate-700 rounded-2xl transition-all duration-700 hover:from-blue-700 hover:to-blue-400"
                          style={{ height: `${(count / maxMonthly) * 100}%`, minHeight: count > 0 ? '12px' : '4px' }}>
                          {count > 0 && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100">{count}</div>}
                        </div>
                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
                <h2 className="text-xl font-black text-slate-900 mb-8">Recent Activity</h2>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {[...grievances].slice(0, 10).map((g, i) => (
                    <div key={g._id || i} className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-3 h-3 rounded-full mt-1 border-2 border-white shadow-sm flex-shrink-0 ${g.status === 'Resolved' ? 'bg-emerald-500' : g.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        {i < 9 && <div className="w-0.5 flex-1 bg-slate-50"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{g.subject || g.title}</h4>
                          <span className="text-[9px] text-slate-300 uppercase ml-2">{new Date(g.createdAt || g.submissionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : g.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{g.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/user/grievances" className="mt-8 block w-full py-4 bg-slate-50 text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-slate-900 hover:text-white transition-all">
                  Full Timeline <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
              <h2 className="text-xl font-black text-slate-900 mb-8 uppercase">Top Categories</h2>
              <div className="space-y-6">
                {topCategories.map(([cat, count]) => (
                  <div key={cat} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-black text-slate-800 uppercase">{cat}</span>
                      <span className="text-xs font-black text-slate-900">{Math.round((count / total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-slate-900 to-slate-600 rounded-full group-hover:from-blue-600 group-hover:to-indigo-500 transition-all duration-500"
                        style={{ width: `${(count / total) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserInsights;
