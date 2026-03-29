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

export default AdminInsightsDashboard;
