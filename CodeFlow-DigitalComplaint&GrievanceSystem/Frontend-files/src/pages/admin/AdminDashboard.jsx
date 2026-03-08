import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, rejected: 0, anonymous: 0 });
    const [recentGrievances, setRecentGrievances] = useState([]);

    const loadData = async () => {
        try {
            const data = await grievanceService.getStatistics();
            const allGrievances = await grievanceService.getAllGrievances();

            setStats({
                total: data.total,
                pending: data.pending,
                resolved: data.resolved,
                inProgress: data.inProgress,
                rejected: data.rejected,
                anonymous: data.anonymous,
            });

            setRecentGrievances(allGrievances.sort((a, b) => new Date(b.submissionDate || b.date) - new Date(a.submissionDate || a.date)).slice(0, 5));
        } catch (error) {
            console.error('[AdminDashboard] Error loading data:', error);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, []);

    const quickLinks = [
        { icon: 'fa-clipboard-list', title: 'All Grievances', desc: 'View & manage all complaints', path: '/admin/grievances', color: 'blue' },
        { icon: 'fa-clipboard-check', title: 'Review Cases', desc: 'Process pending cases', path: '/admin/list', color: 'orange' },
        { icon: 'fa-chart-bar', title: 'Insights', desc: 'Analytics & Reports', path: '/admin/insights', color: 'purple' },
        { icon: 'fa-bullhorn', title: 'Notice Board', desc: 'Manage announcements', path: '/admin/notices', color: 'teal' },
        { icon: 'fa-envelope', title: 'Mail', desc: 'Student Communications', path: '/admin/mail', color: 'red' },
        { icon: 'fa-users-cog', title: 'User Management', desc: 'Manage access control', path: '/admin/users', color: 'slate' },
    ];

    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        slate: 'bg-slate-50 text-slate-600'
    };

    return (
        <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-1">Admin Control Panel</h1>
                <p className="text-slate-500 font-medium">Real-time system oversight and management</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
                {[
                    { label: 'Total', value: stats.total, color: 'blue', icon: 'fa-file-alt' },
                    { label: 'Pending', value: stats.pending, color: 'amber', icon: 'fa-clock' },
                    { label: 'Progress', value: stats.inProgress, color: 'purple', icon: 'fa-spinner' },
                    { label: 'Resolved', value: stats.resolved, color: 'green', icon: 'fa-check' },
                    { label: 'Rejected', value: stats.rejected, color: 'red', icon: 'fa-times' },
                    { label: 'Anonymous', value: stats.anonymous, color: 'slate', icon: 'fa-user-secret' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:scale-105">
                        <div className={`w-10 h-10 ${colorMap[s.color]} rounded-xl flex items-center justify-center mb-4`}>
                            <i className={`fas ${s.icon}`}></i>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{s.value}</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Sections */}
            <div className="space-y-12">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                            <i className="fas fa-th-large text-sm"></i>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Navigation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickLinks.map((link, i) => (
                            <Link key={i} to={link.path} className="group flex items-center p-8 bg-white rounded-[40px] shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-900 group-hover:text-white transition-all duration-500 shadow-inner">
                                    <i className={`fas ${link.icon}`}></i>
                                </div>
                                <div className="ml-6 text-left">
                                    <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-blue-900">{link.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{link.desc}</p>
                                </div>
                                <div className="ml-auto w-10 h-10 rounded-full border border-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all">
                                    <i className="fas fa-arrow-right text-xs"></i>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
