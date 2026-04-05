// ============================================================
// UserDashboard.jsx — REAL BACKEND VERSION
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import grievanceService from '../../services/grievanceService';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const allGrievances = await grievanceService.getUserGrievances(user);
        setStats({
          total: allGrievances.length,
          pending: allGrievances.filter(g => g.status === 'Pending').length,
          resolved: allGrievances.filter(g => g.status === 'Resolved').length,
          inProgress: allGrievances.filter(g => g.status === 'In Progress').length,
        });
      } catch (e) {
        console.error('[UserDashboard] Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User';

  const quickLinks = [
    { title: 'Submit Grievance', icon: 'fa-plus-circle', path: '/user/submit', desc: 'File a new complaint with documents' },
    { title: 'My Grievances', icon: 'fa-clipboard-list', path: '/user/grievances', desc: 'View all submitted complaints' },
    { title: 'Guidelines', icon: 'fa-book', path: '/user/guidelines', desc: 'Read policies and procedures' },
    { title: 'Mail', icon: 'fa-envelope', path: '/user/mail', desc: 'Communicate with administration' }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Welcome back, <span className="text-transparent bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text">{firstName}</span> 👋
        </h1>
        <p className="text-slate-500 font-medium italic">Track your grievances and stay updated with the system</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Grievances', value: loading ? '...' : stats.total, icon: 'fa-file-alt', color: 'blue', status: 'ACTIVE' },
          { label: 'Pending', value: loading ? '...' : stats.pending, icon: 'fa-clock', color: 'amber' },
          { label: 'Resolved', value: loading ? '...' : stats.resolved, icon: 'fa-check-circle', color: 'green' },
          { label: 'In Progress', value: loading ? '...' : stats.inProgress, icon: 'fa-spinner', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            {stat.status && <span className="absolute top-4 right-6 text-[8px] font-black tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stat.status}</span>}
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4 transition-transform group-hover:scale-110`}>
              <i className={`fas ${stat.icon} text-lg`}></i>
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 shadow-inner">
            <i className="fas fa-th-large"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quick Access</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.path} className="group flex items-center p-8 bg-white rounded-[40px] shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl text-slate-400 group-hover:bg-blue-900 group-hover:text-white transition-all duration-500 shadow-inner">
                <i className={`fas ${link.icon}`}></i>
              </div>
              <div className="ml-8 text-left">
                <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-900">{link.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{link.desc}</p>
              </div>
              <div className="ml-auto w-12 h-12 rounded-full border-2 border-slate-50 flex items-center justify-center text-slate-300 group-hover:border-blue-900 group-hover:text-blue-900 transition-all">
                <i className="fas fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
