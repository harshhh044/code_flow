import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';

const getStatusColor = (status) => {
    switch (status) {
        case 'Resolved': return 'bg-green-100 text-green-700';
        case 'Pending': return 'bg-amber-100 text-amber-700';
        case 'In Progress': return 'bg-blue-100 text-blue-700';
        case 'Under Review': return 'bg-indigo-100 text-indigo-700';
        case 'Rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const UserListGrievances = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const [grievances, setGrievances] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Get category from query params
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');

    useEffect(() => {
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        const anonDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');

        let all = [...Object.values(db).flat(), ...anonDb].filter(Boolean).filter(g =>
            (user?.email && (g.email === user.email || g.personalEmail === user.email || g.uniEmail === user.email)) ||
            (user?.personalEmail && (g.email === user.personalEmail || g.personalEmail === user.personalEmail || g.uniEmail === user.personalEmail)) ||
            (user?.uniEmail && (g.email === user.uniEmail || g.personalEmail === user.uniEmail || g.uniEmail === user.uniEmail)) ||
            ((user?.rollNo || user?.studentId) && (g.rollNo === user?.rollNo || g.student_id === user?.studentId || g.student_id === user?.rollNo || g.rollNo === user?.studentId))
        );

        // Filter by category if present in URL (flexible matching)
        if (category) {
            all = all.filter(g =>
                g.category === category ||
                CATEGORIES.find(c => c.value === category)?.label === g.category ||
                CATEGORIES.find(c => c.label === g.category)?.value === category
            );
        }

        setGrievances(all.sort((a, b) => new Date(b.submissionDate || b.date) - new Date(a.submissionDate || a.date)));
    }, [user, category]);

    const catLabel = CATEGORIES.find(c => c.value === category)?.label || category;

    const filtered = grievances.filter(g => {
        const matchStatus = statusFilter === 'All' || g.status === statusFilter;
        const matchSearch = !search ||
            g.subject?.toLowerCase().includes(search.toLowerCase()) ||
            g.code?.toLowerCase().includes(search.toLowerCase()) ||
            g.description?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="min-h-screen bg-transparent">
            {/* Back Button */}
            <Link to="/user/grievances" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-medium mb-6 transition-colors">
                <i className="fas fa-arrow-left text-sm"></i>
                Back to Categories
            </Link>

            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        {category ? `${catLabel} Grievances` : 'My Grievances'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Viewing {filtered.length} grievances in {catLabel || 'all categories'}
                    </p>
                </div>
                <Link
                    to="/user/submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                    <i className="fas fa-plus-circle"></i> Submit New Grievance
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by code, subject, or description..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                        {['All', 'Pending', 'In Progress', 'Under Review', 'Resolved'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === s
                                    ? 'bg-blue-900 text-white shadow-md shadow-blue-900/10'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Table */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm p-20 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <i className="fas fa-inbox text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No grievances found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find any grievances matching your current filters or search terms.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Grievance Code</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Category</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Submitted On</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((g, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/user/grievance/${g.code}`)}>
                                        <td className="px-6 py-5 font-mono text-xs text-blue-700 font-bold whitespace-nowrap">
                                            {g.code}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-800 text-sm mb-0.5 max-w-[250px] truncate group-hover:text-blue-700 transition-colors">
                                                {g.subject}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate max-w-[250px]">
                                                {g.description || 'No description provided'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium whitespace-nowrap">
                                            {g.category}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 whitespace-nowrap font-medium italic">
                                            {new Date(g.submissionDate || g.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(g.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center whitespace-nowrap">
                                            <Link
                                                to={`/user/grievance/${g.code}`}
                                                className="inline-flex items-center gap-1 text-blue-700 font-black text-xs hover:underline decoration-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                VIEW <i className="fas fa-chevron-right text-[10px]"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                            Showing {filtered.length} of {grievances.length} grievances
                        </span>
                        <div className="flex gap-2">
                            {/* Pagination would go here if needed */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListGrievances;
