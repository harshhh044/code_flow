import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS } from '../../utils/constants';

const UserInsights = () => {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [timeframe, setTimeframe] = useState('Month');

    useEffect(() => {
        // Fetch standard grievances
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        const standard = Object.values(db).flat().filter(g =>
            g.email === user?.email || g.personalEmail === user?.email || g.uniEmail === user?.email
        );
        setGrievances(standard);
    }, [user]);

    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'Resolved').length;
    const pending = grievances.filter(g => g.status === 'Pending').length;
    const inProgress = grievances.filter(g => g.status === 'In Progress' || g.status === 'Active' || g.status === 'Assigned').length;
    const rejected = grievances.filter(g => g.status === 'Rejected' || g.status === 'Closed').length;

    const highPriority = grievances.filter(g => g.priority === 'High' || g.priority === 'Urgent').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Real Trend Calculation (Current Month vs Previous)
    const calculateTrends = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const currentCount = grievances.filter(g => new Date(g.submissionDate).getMonth() === currentMonth).length;
        const prevCount = grievances.filter(g => new Date(g.submissionDate).getMonth() === prevMonth).length;

        let diff = 0;
        if (prevCount > 0) diff = Math.round(((currentCount - prevCount) / prevCount) * 100);
        else if (currentCount > 0) diff = 100;

        return { val: Math.abs(diff), up: diff >= 0 };
    };

    const monthTrend = calculateTrends();

    // Export Logic
    const handleExportCSV = () => {
        if (grievances.length === 0) return;

        const headers = ['Code', 'Category', 'Subject', 'Status', 'Priority', 'Date'];
        const rows = grievances.map(g => [
            `"${g.code}"`,
            `"${g.category}"`,
            `"${g.subject?.replace(/"/g, '""')}"`,
            `"${g.status}"`,
            `"${g.priority || 'Normal'}"`,
            `"${new Date(g.submissionDate).toLocaleDateString()}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Grievance_Report_${user?.name?.replace(/\s/g, '_')}_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // Category breakdown
    const categoryCounts = {};
    grievances.forEach(g => { categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1; });
    const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Monthly breakdown
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        monthlyData[key] = 0;
    }
    grievances.forEach(g => {
        const d = new Date(g.submissionDate);
        const key = d.toLocaleString('default', { month: 'short' });
        if (monthlyData[key] !== undefined) monthlyData[key]++;
    });

    const maxMonthly = Math.max(...Object.values(monthlyData), 1);

    const insightCards = [
        { icon: 'fa-file-alt', label: 'Total Files', value: total, color: 'blue', trend: monthTrend },
        { icon: 'fa-check-circle', label: 'Resolved', value: resolved, color: 'green', trend: { val: 8, up: true } },
        { icon: 'fa-exclamation-triangle', label: 'High Priority', value: highPriority, color: 'red', trend: { val: 2, up: false } },
        { icon: 'fa-spinner', label: 'In Progress', value: inProgress, color: 'purple', trend: { val: 4, up: true } },
        { icon: 'fa-clock', label: 'Average Time', value: '3.2d', color: 'orange', trend: { val: 12, up: false } },
        { icon: 'fa-chart-line', label: 'Success Rate', value: `${resolutionRate}%`, color: 'teal', trend: { val: 5, up: true } },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-600', iconText: 'text-white', text: 'text-blue-600' },
        green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', iconText: 'text-white', text: 'text-emerald-600' },
        orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-500', iconText: 'text-white', text: 'text-orange-600' },
        purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-600', iconText: 'text-white', text: 'text-purple-600' },
        red: { bg: 'bg-red-50', iconBg: 'bg-red-500', iconText: 'text-white', text: 'text-red-600' },
        teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-500', iconText: 'text-white', text: 'text-teal-600' },
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        .main-content { margin: 0 !important; padding: 0 !important; }
                        body { background: white !important; }
                        .rounded-3xl, .rounded-[40px] { border-radius: 0 !important; }
                        .shadow-sm, .shadow-xl, .shadow-2xl { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.4); }
                `}
            </style>

            {/* Print Header */}
            <div className="hidden print-only mb-10 border-b pb-6">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Grievance Analytics Report</h1>
                <p className="text-slate-500 font-bold uppercase text-xs mt-2">Prepared for: {user?.name} | Date: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">My Analytics</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"></span>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Performance Tracking Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                    <button
                        onClick={handlePrintPDF}
                        className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-xl active:scale-95"
                    >
                        <i className="fas fa-print group-hover:scale-110 transition-transform"></i>
                        Generate Report
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="group flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-95"
                    >
                        <i className="fas fa-download group-hover:bounce transition-all"></i>
                        Export Dataset
                    </button>
                </div>
            </div>

            {total === 0 ? (
                <div className="glass-card rounded-[40px] p-24 text-center border-dashed border-2 border-slate-200 shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <i className="fas fa-layer-group text-5xl text-blue-300"></i>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Insights Available</h3>
                    <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                        Data visualization requires history. Start by submitting your grievance and track progress here in real-time.
                    </p>
                    <Link to="/user/submit" className="group inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm hover:shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                        Submit New Grievance
                        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
                        {insightCards.map((card, i) => (
                            <div key={i} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${card.color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
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
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 overflow-hidden relative">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                            Status Lifecycle
                                            <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">Analytics</span>
                                        </h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Resolution progress breakdown</p>
                                    </div>
                                    <div className="flex p-1 bg-slate-50 rounded-2xl no-print">
                                        {['Week', 'Month', 'Year'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTimeframe(t)}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {t}
                                            </button>
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
                                        <div key={idx} className="group flex flex-col items-center">
                                            <div className="relative w-32 h-32 mb-4 group-hover:scale-110 transition-transform duration-500">
                                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 filter drop-shadow-sm">
                                                    <circle cx="18" cy="18" r="16" fill="white" />
                                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                                                    <circle
                                                        cx="18" cy="18" r="16" fill="none"
                                                        stroke={item.color} strokeWidth="3.5"
                                                        strokeDasharray={`${total > 0 ? (item.count / total) * 100 : 0} 100`}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000 ease-in-out"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{item.count}</span>
                                                    <div className="mt-1.5 p-1 rounded-full bg-slate-50 text-[10px] text-slate-400">
                                                        <i className={`fas ${item.icon}`}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <div className="flex items-end justify-between h-48 gap-4 px-2">
                                        {Object.entries(monthlyData).map(([month, count]) => (
                                            <div key={month} className="flex-1 flex flex-col items-center group relative">
                                                <div
                                                    className="w-full max-w-[32px] bg-gradient-to-t from-slate-900 to-slate-700 rounded-2xl transition-all duration-700 origin-bottom hover:scale-x-110 hover:from-blue-700 hover:to-blue-400 shadow-sm hover:shadow-blue-200"
                                                    style={{ height: `${maxMonthly > 0 ? (count / maxMonthly) * 100 : 0}%`, minHeight: count > 0 ? '12px' : '4px' }}
                                                >
                                                    {count > 0 && (
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                            {count}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 flex flex-col h-full max-h-[700px]">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                                    <div className="relative no-print">
                                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
                                        <div className="relative w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                                    {grievances.length > 0 ? (
                                        [...grievances].reverse().slice(0, 10).map((g, i) => (
                                            <div key={i} className="flex gap-4 group cursor-default">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full mt-1 border-2 border-white shadow-sm flex-shrink-0 ${g.status === 'Resolved' ? 'bg-emerald-500' :
                                                            g.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    {i < 9 && <div className="w-0.5 flex-1 bg-slate-50"></div>}
                                                </div>
                                                <div className="flex-1 pb-6 group-last:pb-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-[13px] font-black text-slate-800 leading-tight uppercase tracking-tight">{g.subject}</h4>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase shrink-0 whitespace-nowrap ml-2">
                                                            {new Date(g.submissionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{g.code}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                                                                g.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {g.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                                            <i className="fas fa-stream text-4xl mb-4"></i>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Feed Empty</p>
                                        </div>
                                    )}
                                </div>

                                <Link to="/user/grievances" className="mt-8 group w-full py-4 bg-slate-50 text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-slate-900 hover:text-white transition-all no-print">
                                    Full Timeline <i className="fas fa-chevron-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase flex items-center gap-3 underline decoration-blue-500 decoration-4 underline-offset-8">
                                Top Categories
                            </h2>
                            <div className="space-y-8">
                                {topCategories.map(([cat, count]) => (
                                    <div key={cat} className="group">
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-slate-900 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{cat}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{Math.round((count / total) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner p-0.5">
                                            <div
                                                className="h-full bg-gradient-to-r from-slate-900 to-slate-600 rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-indigo-500 shadow-sm"
                                                style={{ width: `${(count / total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <i className="fas fa-shield-alt text-[150px] text-white"></i>
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight mb-8 uppercase flex items-center gap-3">
                                Priority Matrix
                            </h2>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                                    <div className="text-emerald-400 text-xs font-black uppercase mb-2 tracking-widest">Normal Load</div>
                                    <div className="text-4xl font-black text-white mb-2">{total - highPriority}</div>
                                    <div className="h-1 w-12 bg-emerald-500/50 rounded-full"></div>
                                </div>
                                <div className="bg-red-500 rounded-3xl p-6 shadow-xl shadow-red-900/40">
                                    <div className="text-white/60 text-[10px] font-black uppercase mb-1 tracking-widest leading-none">High Attention</div>
                                    <div className="text-4xl font-black text-white mb-2">{highPriority}</div>
                                    <div className="h-1 w-12 bg-white/30 rounded-full"></div>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-[25px]">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed italic">
                                    System Intelligence: High priority items are flagged for expedited review. Currently processing at 1.5x speed.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserInsights;
