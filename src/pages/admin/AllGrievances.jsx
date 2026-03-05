import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminAllGrievances = () => {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadCounts();
    }, []);

    const loadCounts = async () => {
        setIsRefreshing(true);
        try {
            const stats = await grievanceService.getStatistics();
            setCounts(stats.byCategory || {});
        } catch (error) {
            console.error('Failed to load counts:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Helping mapping for colors since constants don't have them
    const getColorForCategory = (val) => {
        const colors = {
            'Academic': 'from-blue-500 to-indigo-600',
            'Examination & Evaluations': 'from-emerald-500 to-teal-600',
            'Administrative': 'from-orange-500 to-amber-600',
            'Hostel Facilities': 'from-purple-500 to-violet-600',
            'Library service': 'from-pink-500 to-rose-600',
            'sports': 'from-red-500 to-orange-600',
            'Financial & others': 'from-cyan-500 to-blue-600',
            'IT & Digital service': 'from-slate-700 to-slate-900',
            'security': 'from-gray-600 to-gray-800',
            'Transport & Community': 'from-yellow-500 to-amber-600',
            'canteen': 'from-orange-400 to-red-500',
            'Placement & Career': 'from-indigo-500 to-purple-600',
            'Registrar office': 'from-blue-700 to-blue-900',
            'Harassment/Ragging': 'from-rose-600 to-red-800',
            'other': 'from-slate-400 to-slate-600'
        };
        return colors[val] || 'from-slate-500 to-slate-700';
    };

    const totalGrievances = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grievance Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                        <i className="fas fa-layer-group text-blue-500"></i>
                        Comprehensive management for all student concerns and complaints
                    </p>
                </div>

                <button
                    onClick={loadCounts}
                    disabled={isRefreshing}
                    className={`px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm flex items-center gap-3 active:scale-95 disabled:opacity-50`}
                >
                    <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin text-blue-500' : ''}`}></i>
                    {isRefreshing ? 'Refreshing...' : 'Update Counts'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.value}
                        onClick={() => navigate(`/admin/list?category=${encodeURIComponent(cat.value)}`)}
                        className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden"
                    >
                        {/* Background Accent */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getColorForCategory(cat.value)} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${getColorForCategory(cat.value)} flex items-center justify-center text-white text-2xl shadow-lg group-hover:rotate-6 transition-transform`}>
                                <i className={`fas ${cat.icon}`}></i>
                            </div>
                            <div className="text-right">
                                <span className={`text-5xl font-black block group-hover:text-blue-600 transition-colors ${counts[cat.value] > 0 ? 'text-slate-900' : 'text-slate-200'}`}>
                                    {counts[cat.value] || 0}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 truncate pr-4">{cat.label}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                                Manage and respond to issues regarding {cat.label.toLowerCase()} submitted by students.
                            </p>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                        <i className="fas fa-user text-[10px] text-slate-400"></i>
                                    </div>
                                ))}
                            </div>
                            <span className="text-blue-600 text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                Open Cases <i className="fas fa-arrow-right text-xs"></i>
                            </span>
                        </div>

                        {cat.danger && (
                            <div className="absolute top-4 left-4">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary Footer */}
            <div className="mt-12 bg-gradient-to-r from-blue-900 via-blue-900 to-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full"></div>
                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-2xl font-black mb-1">System-wide Overview</h2>
                    <p className="text-blue-200 font-medium opacity-80">Aggregated tracking across all complaint categories</p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center bg-white/10 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <p className="text-4xl font-black">{totalGrievances}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Submitted</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/list?category=all')}
                        className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        View Full Database
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAllGrievances;


