import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import grievanceService from '../../services/grievanceService';
import mailService from '../../services/mailService';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ issueType: '', priority: '', subject: '', description: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allGrievances = await grievanceService.getUserGrievances(user);

        setStats({
          total: allGrievances.length,
          pending: allGrievances.filter(g => g.status?.toLowerCase() === 'pending').length,
          resolved: allGrievances.filter(g => g.status?.toLowerCase() === 'resolved').length,
          inProgress: allGrievances.filter(g => g.status?.toLowerCase() === 'in-progress' || g.status?.toLowerCase() === 'processing').length
        });
      } catch (e) {
        console.error("Error loading dashboard stats:", e);
      }
    };
    if (user?.email) fetchStats();
  }, [user?.email]);

  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User';

  const quickLinks = [
    { title: 'Submit Grievance', icon: 'fa-plus-circle', path: '/user/submit', desc: 'File a new complaint with documents' },
    { title: 'My Grievances', icon: 'fa-clipboard-list', path: '/user/grievances', desc: 'View all submitted complaints' },
    { title: 'Guidelines', icon: 'fa-book', path: '/user/guidelines', desc: 'Read policies and procedures' },
    { title: 'Mail', icon: 'fa-envelope', path: '/user/mail', desc: 'Communicate with administration' }
  ];

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      await mailService.sendMessage({
        to: 'Admin',
        toEmail: 'admin@codeflow.edu',
        subject: `Support: ${supportForm.subject}`,
        body: `Issue Type: ${supportForm.issueType}\nPriority: ${supportForm.priority}\n\n${supportForm.description}`,
        isSupportQuery: true
      });
      setSupportForm({ issueType: '', priority: '', subject: '', description: '' });
      setShowSupportModal(false);
      alert('Support query submitted successfully!');
    } catch (error) {
      alert('Failed to submit support query. Please try again.');
    }
  };

  // Fixed mapping for Tailwind dynamic classes (to avoid purging in production)
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Welcome back, <span className="text-transparent bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text transition-all">{firstName}</span> 👋
        </h1>
        <p className="text-slate-500 font-medium italic">Track your grievances and stay updated with the system</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Grievances', value: stats.total, icon: 'fa-file-alt', color: 'blue', status: 'ACTIVE' },
          { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: 'amber' },
          { label: 'Resolved', value: stats.resolved, icon: 'fa-check-circle', color: 'green' },
          { label: 'In Progress', value: stats.inProgress, icon: 'fa-spinner', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            {stat.status && <span className="absolute top-4 right-6 text-[8px] font-black tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stat.status}</span>}
            <div className={`w-12 h-12 rounded-2xl ${colorMap[stat.color].bg} flex items-center justify-center ${colorMap[stat.color].text} mb-4 transition-transform group-hover:scale-110`}>
              <i className={`fas ${stat.icon} text-lg`}></i>
            </div>
            <div className="text-3xl font-black text-slate-800 mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
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
                <h4 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-blue-900">{link.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{link.desc}</p>
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
