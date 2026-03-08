import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminListGrievances = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category') || 'all';

    const [grievances, setGrievances] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const activeCategory = CATEGORIES.find(c => c.value === categoryParam) || { label: 'All', value: 'all' };

    const loadGrievances = async () => {
        setLoading(true);
        try {
            const all = await grievanceService.getAllGrievances();

            let filtered = all;

            // Filter by category if not 'all'
            if (categoryParam.toLowerCase() !== 'all') {
                const matchedParam = CATEGORIES.find(c => c.value === categoryParam || c.label === categoryParam);
                const paramValue = matchedParam ? matchedParam.value.toLowerCase() : categoryParam.toLowerCase();

                filtered = all.filter(g => {
                    const gCat = g.category;
                    const matchedCat = CATEGORIES.find(c => c.value === gCat || c.label === gCat);
                    const gValue = matchedCat ? matchedCat.value.toLowerCase() : gCat?.toLowerCase();
                    return gValue === paramValue;
                });
            }

            // Sort by date (desc)
            filtered.sort((a, b) => new Date(b.submissionDate || b.date) - new Date(a.submissionDate || a.date));

            setGrievances(filtered);
        } catch (error) {
            console.error('Failed to load grievances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGrievances();
    }, [categoryParam]);

    const filtered = grievances.filter(g => {
        const matchStatus = statusFilter === 'All' || g.status === statusFilter;
        const matchSearch = !search ||
            g.subject?.toLowerCase().includes(search.toLowerCase()) ||
            g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            g.student_id?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getCategoryLabel = (val) => {
        return CATEGORIES.find(c => c.value === val)?.label || val;
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/admin/grievances" className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 capitalize">
                            {activeCategory.label} Grievances
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium ml-13">
                        Total of {filtered.length} records found in this section
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="p-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <i className="fas fa-download"></i>
                    </button>
                    <button className="p-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <i className="fas fa-print"></i>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find by code, subject, student name or ID..."
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${statusFilter === s ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100">
                    <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">Querying database...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-folder-open text-3xl text-slate-300"></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Empty Records</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any student grievances matching your current filters in this category.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Reference</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Topic / Category</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Details</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status Badge</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Submission</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((g, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                                {g.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="max-w-[250px]">
                                                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{g.subject}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{getCategoryLabel(g.category)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {g.isAnonymous ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                                                        <i className="fas fa-user-secret"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-purple-700 tracking-tight">Protected Identity</p>
                                                        <p className="text-[10px] text-purple-400 font-bold">ANONYMOUS</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                                                        {(g.first_name || 'U')[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 tracking-tight">{g.first_name || 'Student'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{g.student_id || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${getStatusStyles(g.status)}`}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {new Date(g.submissionDate || g.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(g.submissionDate || g.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/grievances/${g.code}`}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-500 shadow-sm transition-all"
                                                    title="View Full Details"
                                                >
                                                    <i className="fas fa-eye text-xs"></i>
                                                </Link>
                                                <Link
                                                    to={`/admin/review/${g.code}`}
                                                    className="w-10 h-10 flex items-center justify-center bg-blue-900 border border-blue-900 rounded-xl text-white hover:bg-black shadow-md shadow-blue-900/20 transition-all"
                                                    title="Adjudicate Case"
                                                >
                                                    <i className="fas fa-file-contract text-xs"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminListGrievances;

