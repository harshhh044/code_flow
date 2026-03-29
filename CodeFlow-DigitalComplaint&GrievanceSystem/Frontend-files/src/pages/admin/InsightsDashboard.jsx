import { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminInsightsDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        inProgress: 0,
        rejected: 0,
        highPriority: 0,
        anonymous: 0
    });
    const [allGrievances, setAllGrievances] = useState([]);
    const [categoryGroups, setCategoryGroups] = useState({});
    const [monthlyData, setMonthlyData] = useState({});
    const [avgResolveTime, setAvgResolveTime] = useState('—');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await grievanceService.getStatistics();
                const grievances = await grievanceService.getAllGrievances();

                setAllGrievances(grievances);

                setStats({
                    total: data.total,
                    pending: data.pending,
                    resolved: data.resolved,
                    inProgress: data.inProgress,
                    rejected: data.rejected,
                    highPriority: grievances.filter(g => g.priority === 'High' || g.priority === 'Urgent').length,
                    anonymous: data.anonymous
                });

                // Group by category for the "Category Hub"
                const groups = {};
                grievances.forEach(g => {
                    if (!groups[g.category]) groups[g.category] = [];
                    groups[g.category].push(g);
                });
                setCategoryGroups(groups);

                // Monthly breakdown
                setMonthlyData(data.byMonth || {});

                // Average resolution time
                const resolved = grievances.filter(g => (g.status === 'Resolved' || g.status === 'Solved') && g.reviewDate);
                if (resolved.length > 0) {
                    const avg = resolved.reduce((acc, g) => acc + (new Date(g.reviewDate) - new Date(g.submissionDate)), 0) / resolved.length;
                    const days = Math.round(avg / 86400000);
                    setAvgResolveTime(`${days} day${days !== 1 ? 's' : ''}`);
                }
            } catch (error) {
                console.error("Failed to load insights:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const maxMonthly = Math.max(...Object.values(monthlyData).map(m => m.submitted), 1);

    const handleExportCSV = () => {
        if (allGrievances.length === 0) return;

        const headers = ['Code', 'Complainant', 'Email', 'Category', 'Subject', 'Status', 'Priority', 'Date'];
        const rows = allGrievances.map(g => [
            `"${g.code}"`,
            `"${g.isAnonymous ? 'Anonymous' : (g.fullName || g.first_name || 'N/A')}"`,
            `"${g.email || 'N/A'}"`,
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
        link.setAttribute("download", `System_Grievance_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    // Top categories for mirroring User Insights layout
    const topCategories = Object.entries(categoryGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5);

    const kpiCards = [
        { label: 'Total Volume', value: stats.total, icon: 'fa-file-invoice', color: 'blue', sub: 'All time submissions' },
        { label: 'System Success', value: `${resolutionRate}%`, icon: 'fa-check-double', color: 'green', sub: `${stats.resolved} resolved cases` },
        { label: 'Pending Action', value: stats.pending, icon: 'fa-hourglass-start', color: 'orange', sub: 'Awaiting first review' },
        { label: 'Priority Alerts', value: stats.highPriority, icon: 'fa-fire-alt', color: 'red', sub: 'High & Urgent cases' },
        { label: 'Resolution Vel.', value: avgResolveTime, icon: 'fa-bolt', color: 'purple', sub: 'Mean time to solve' },
        { label: 'Privacy Mode', value: stats.anonymous, icon: 'fa-user-secret', color: 'teal', sub: 'Anonymous filings' },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-600', iconText: 'text-white', accent: 'blue-500' },
        green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', iconText: 'text-white', accent: 'emerald-500' },
        orange: { bg: 'bg-amber-50', iconBg: 'bg-amber-500', iconText: 'text-white', accent: 'amber-500' },
        purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-600', iconText: 'text-white', accent: 'purple-500' },
        red: { bg: 'bg-red-50', iconBg: 'bg-red-500', iconText: 'text-white', accent: 'red-500' },
        teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-500', iconText: 'text-white', accent: 'teal-500' },
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Compiling System Metrics...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto pb-10">
                <style>
                    {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white !important; }
                        .glass-card { backdrop-filter: none !important; background: white !important; border: 1px solid #e2e8f0 !important; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.4); }
                `}
                </style>

                {/* Print Header */}
                <div className="hidden print-only mb-10 border-b pb-6">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">System Intelligence Report</h1>
                    <p className="text-slate-500 font-bold uppercase text-xs mt-2">Administrator Oversight Dashboard | Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">System Analytics</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-1 bg-gradient-to-r from-slate-900 to-blue-600 rounded-full"></span>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Global Insights & Performance Monitoring</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                        <button
                            onClick={handlePrint}
                            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95"
                        >
                            <i className="fas fa-print group-hover:scale-110 transition-transform"></i>
                            Print Audit
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:scale-95"
                        >
                            <i className="fas fa-file-export group-hover:rotate-12 transition-all"></i>
                            Export Dataset
                        </button>
                    </div>
                </div>

                {stats.total === 0 ? (
                    <div className="glass-card rounded-[40px] p-24 text-center border-dashed border-2 border-slate-200 shadow-xl animate-in zoom-in duration-500">
                        <div className="w-32 h-32 bg-slate-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <i className="fas fa-chart-line text-5xl text-slate-300"></i>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Live Data Streams</h3>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">The analytics engine is online but awaiting initial student submissions. System metrics will populate automatically.</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10 no-print">
                            {kpiCards.map((card, i) => (
                                <div key={i} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${colorMap[card.color].iconBg} ${colorMap[card.color].iconText}`}>
                                            <i className={`fas ${card.icon}`}></i>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-slate-100 animate-pulse"></div>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{card.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{card.label}</div>
                                    <p className="text-[8px] font-bold text-slate-300 mt-2 truncate group-hover:text-slate-500 transition-colors uppercase">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                            {/* Status Lifecycle (Mirrored Layout) */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 overflow-hidden h-full">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                                                Resolution Pulse
                                            </h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lifecycle distribution analytics</p>
                                        </div>
                                        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mr-2">Live Update</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                                        {[
                                            { label: 'Resolved', count: stats.resolved, color: '#10B981', icon: 'fa-check-circle' },
                                            { label: 'Pending', count: stats.pending, color: '#F59E0B', icon: 'fa-clock' },
                                            { label: 'Active', count: stats.inProgress, color: '#3B82F6', icon: 'fa-spinner' },
                                            { label: 'Rejected', count: stats.rejected, color: '#EF4444', icon: 'fa-times-circle' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className="relative w-32 h-32 mb-4">
                                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                                                        <circle
                                                            cx="18" cy="18" r="16" fill="none"
                                                            stroke={item.color} strokeWidth="4"
                                                            strokeDasharray={`${stats.total > 0 ? (item.count / stats.total) * 100 : 0} 100`}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-1000 ease-in-out"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{item.count}</span>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Cases</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 h-48 no-print">
                                        <div className="flex items-end justify-between h-full gap-3 px-2">
                                            {Object.entries(monthlyData).slice(-6).map(([month, data]) => (
                                                <div key={month} className="flex-1 flex flex-col items-center group relative">
                                                    <div className="w-full flex flex-col items-center gap-0.5">
                                                        <div
                                                            className="w-full max-w-[12px] bg-slate-900 rounded-full transition-all duration-500 origin-bottom hover:bg-blue-600 shadow-sm"
                                                            style={{ height: `${(data.submitted / maxMonthly) * 120}px`, minHeight: data.submitted > 0 ? '6px' : '2px' }}
                                                        ></div>
                                                        <div
                                                            className="w-full max-w-[12px] bg-emerald-500 rounded-full transition-all duration-500 origin-bottom hover:bg-emerald-400 shadow-sm"
                                                            style={{ height: `${(data.resolved / maxMonthly) * 120}px`, minHeight: data.resolved > 0 ? '4px' : '0' }}
                                                        ></div>
                                                    </div>
                                                    <span className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter transition-colors group-hover:text-slate-900">{month}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Volume Feed (Mirrored & Improved) */}
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 flex flex-col h-full max-h-[600px]">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase flex items-center justify-between">
                                        Recent Feed
                                        <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold">Live</span>
                                    </h2>

                                    <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                                        {allGrievances.slice(0, 10).map((g, i) => (
                                            <div key={i} className="flex gap-4 group cursor-default">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full mt-1.5 border-2 border-white shadow-sm flex-shrink-0 ${g.status?.toLowerCase() === 'resolved' ? 'bg-emerald-500' :
                                                        g.priority?.toLowerCase() === 'high' || g.priority?.toLowerCase() === 'urgent' ? 'bg-red-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    <div className="w-0.5 flex-1 bg-slate-50 group-last:bg-transparent"></div>
                                                </div>
                                                <div className="flex-1 pb-6 group-last:pb-0 border-b border-slate-50 group-last:border-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-[13px] font-black text-slate-800 leading-tight uppercase tracking-tight line-clamp-1">{g.subject}</h4>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase shrink-0 whitespace-nowrap ml-2">
                                                            {new Date(g.submissionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{g.isAnonymous ? 'ANON' : (g.fullName || 'STU')}</span>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${g.status?.toLowerCase() === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {g.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="mt-8 group w-full py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-blue-600 transition-all no-print">
                                        Full Audit Logs <i className="fas fa-chevron-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Category Hub (Multi-Category Admin View) - Key Requirement */}
                        <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl mb-10 overflow-hidden relative group">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                                        Category Intelligence Hub
                                        <span className="text-[10px] font-black px-3 py-1 bg-blue-500 text-white rounded-full">Admin Multi-View</span>
                                    </h2>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1 italic">Analyzing student grievances across all departments</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                {CATEGORIES.slice(0, 8).map((cat, idx) => {
                                    const count = categoryGroups[cat.value]?.length || 0;
                                    const unresolved = categoryGroups[cat.value]?.filter(g => g.status !== 'Resolved').length || 0;

                                    return (
                                        <div key={idx} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all group/item cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cat.danger ? 'bg-red-500 text-white' : 'bg-white/10 text-white'} transition-colors group-hover/item:bg-blue-600`}>
                                                    <i className={`fas ${cat.icon}`}></i>
                                                </div>
                                                <span className="text-2xl font-black text-white leading-none">{count}</span>
                                            </div>
                                            <h3 className="text-[11px] font-black text-white/80 uppercase tracking-widest mb-1 truncate">{cat.label}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${count > 0 ? ((count - unresolved) / count) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[9px] font-black text-blue-400">{unresolved} pending</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Top Performers / Volume (Mirrored from User side) */}
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 min-h-[400px]">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase flex items-center gap-3 underline decoration-slate-900 decoration-4 underline-offset-8">
                                    Department Volume
                                </h2>
                                <div className="space-y-8">
                                    {topCategories.map(([catVal, items]) => {
                                        const category = CATEGORIES.find(c => c.value === catVal) || { label: catVal };
                                        const percent = Math.round((items.length / stats.total) * 100);
                                        return (
                                            <div key={catVal} className="group">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-6 bg-slate-900 rounded-full group-hover:bg-blue-600 transition-all"></div>
                                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{category.label}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-900">{percent}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner p-0.5">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-blue-400"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Priority Matrix (Admin Focus) */}
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase flex items-center gap-3">
                                        Priority Heatmap
                                    </h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group hover:border-red-200 transition-colors cursor-default">
                                            <div className="text-red-500 text-[9px] font-black uppercase mb-1 tracking-widest">Urgent / High</div>
                                            <div className="text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 transition-transform">{stats.highPriority}</div>
                                            <div className="h-1 w-12 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group hover:border-emerald-200 transition-colors cursor-default">
                                            <div className="text-emerald-500 text-[9px] font-black uppercase mb-1 tracking-widest">Standard Load</div>
                                            <div className="text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 transition-transform">{stats.total - stats.highPriority}</div>
                                            <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 p-5 bg-slate-900 rounded-[30px] relative overflow-hidden group/alert">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/alert:rotate-12 transition-all">
                                        <i className="fas fa-microchip text-6xl text-white"></i>
                                    </div>
                                    <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        System Recommendation
                                    </h4>
                                    <p className="text-white/60 text-[10px] font-medium leading-relaxed italic">
                                        {stats.highPriority > stats.total * 0.2
                                            ? "High volume of urgent cases detected. Consider re-allocating resources to key departments."
                                            : "System health is optimal. Resolution velocity is within institutional guidelines."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminInsightsDashboard;
