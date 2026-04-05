import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, rejected: 0, anonymous: 0 });
    const [recentGrievances, setRecentGrievances] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('[AdminDashboard] Loading statistics...');
                const data = await grievanceService.getStatistics();
                const allGrievances = await grievanceService.getAllGrievances();

                console.log('[AdminDashboard] Statistics loaded:', {
                    total: data.total,
                    grievances: allGrievances.length
                });

                setStats({
                    total: data.total,
                    pending: data.pending,
                    resolved: data.resolved,
                    inProgress: data.inProgress,
                    rejected: data.rejected,
                    anonymous: data.anonymous,
                });

                setRecentGrievances(allGrievances.sort((a, b) => new Date(b.submissionDate || b.date) - new Date(a.submissionDate || a.date)).slice(0, 5));

                // Category breakdown
                const sorted = Object.entries(data.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
                setCategoryData(sorted);
            } catch (error) {
                console.error('[AdminDashboard] Error loading data:', error);
            }
        };
        
        // Load data immediately
        loadData();
        
        // Optionally refresh every 5 seconds to catch new grievances
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (s) => ({
        Resolved: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700',
        'In Progress': 'bg-blue-100 text-blue-700', Rejected: 'bg-red-100 text-red-700'
    }[s] || 'bg-gray-100 text-gray-600');

    const quickLinks = [
        { icon: 'fa-clipboard-list', title: 'All Grievances', desc: 'View & manage all complaints', path: '/admin/grievances', color: 'blue' },
        { icon: 'fa-clipboard-check', title: 'Review Cases', desc: 'Process pending cases', path: '/admin/list', color: 'orange' },
        { icon: 'fa-search', title: 'Check Status', desc: 'Track any grievance', path: '/admin/status', color: 'green' },
        { icon: 'fa-chart-bar', title: 'Insights', desc: 'View analytics & reports', path: '/admin/insights', color: 'purple' },
        { icon: 'fa-bullhorn', title: 'Notice Board', desc: 'Manage announcements', path: '/admin/notices', color: 'teal' },
        { icon: 'fa-envelope', title: 'Mail', desc: 'Communicate with students', path: '/admin/mail', color: 'red' },
    ];

    const colorMap = {
        blue: 'bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
        orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white',
        green: 'bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white',
        purple: 'bg-purple-100 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
        teal: 'bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
        red: 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white',
    };

    return (
        <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Welcome Back, Admin </h1>
                <p className="text-slate-500">Grievance Management Overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
                {[
                    { icon: 'fa-file-alt', label: 'Total Grievances', value: stats.total, color: 'blue' },
                    { icon: 'fa-clock', label: 'Pending', value: stats.pending, color: 'amber' },
                    { icon: 'fa-spinner', label: 'In Progress', value: stats.inProgress, color: 'purple' },
                    { icon: 'fa-check-circle', label: 'Resolved', value: stats.resolved, color: 'green' },
                    { icon: 'fa-times-circle', label: 'Rejected', value: stats.rejected, color: 'red' },
                    { icon: 'fa-user-secret', label: 'Anonymous', value: stats.anonymous, color: 'slate' },
                ].map((s, i) => (
                    <div key={i} className="group relative bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 mb-4 transition-transform group-hover:scale-110`}>
                            <i className={`fas ${s.icon} text-lg`}></i>
                        </div>
                        <div className="text-3xl font-black text-slate-800 mb-1">{s.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="mb-8">
                {/* Quick Access Section */}
                <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 shadow-inner">
                        <i className="fas fa-th-large"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quick Access</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default AdminDashboard;
