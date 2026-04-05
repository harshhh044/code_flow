import { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import noticeService from '../../services/noticeService';

const UserNoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const loadNotices = async () => {
        try {
            const data = await noticeService.getNotices();
            setNotices(data);
        } catch (error) {
            console.error('Failed to load notices:', error);
        }
    };

    useEffect(() => {
        loadNotices();
    }, []);

    const categories = ['All', ...new Set(notices.filter(n => n && n.category).map(n => n.category))];
    const filtered = notices.filter(n => {
        const matchCat = filter === 'All' || n.category === filter;
        const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleViewDetails = (notice) => {
        setSelected(notice);
        setIsModalOpen(true);
    };

    const getPriorityBadgeClass = (p) => {
        const priority = p?.toLowerCase();
        if (priority === 'urgent') return 'bg-red-100 text-red-600 border-red-200';
        if (priority === 'high' || priority === 'important') return 'bg-orange-100 text-orange-600 border-orange-200';
        return 'bg-green-100 text-green-600 border-green-200';
    };

    const getCategoryBadgeClass = (c) => {
        const category = c?.toLowerCase();
        const map = {
            academic: 'bg-blue-100 text-blue-600 border-blue-200',
            exam: 'bg-blue-100 text-blue-600 border-blue-200',
            important: 'bg-amber-100 text-amber-600 border-amber-200',
            events: 'bg-purple-100 text-purple-600 border-purple-200',
            general: 'bg-slate-100 text-slate-500 border-slate-200'
        };
        return map[category] || 'bg-slate-100 text-slate-500 border-slate-200';
    };

    const getLeftAccentClass = (n) => {
        const priority = n.priority?.toLowerCase();
        const category = n.category?.toLowerCase();
        if (priority === 'urgent') return 'border-l-[6px] border-l-red-500';
        if (category === 'events') return 'border-l-[6px] border-l-green-500';
        if (category === 'academic' || category === 'exam') return 'border-l-[6px] border-l-blue-500';
        return 'border-l-[6px] border-l-slate-400';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-4">
                    <i className="fas fa-bullhorn text-blue-600"></i>
                    Notice Board
                </h1>
                <p className="text-slate-500 mt-3 text-lg">Official announcements and important updates shared by the administration</p>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                <div className="flex flex-col md:row gap-4 items-center justify-between md:flex-row">
                    <div className="relative flex-1 max-w-md w-full">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search notices..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-slate-600 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer appearance-none min-w-[160px]"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748b\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                        >
                            <option value="All">All Categories</option>
                            {categories.filter(c => c !== 'All').map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Notices Grid/List */}
            <div className="grid grid-cols-1 gap-6">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                        <i className="fas fa-inbox text-6xl text-slate-200 mb-4 block"></i>
                        <h3 className="text-xl font-bold text-slate-700">No notices found</h3>
                        <p className="text-slate-400">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    filtered.map(n => (
                        <div key={n._id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group ${getLeftAccentClass(n)}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 text-xs font-semibold text-slate-400">
                                        <span className="flex items-center gap-1.5"><i className="far fa-calendar-alt text-blue-500"></i> {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center gap-1.5"><i className="far fa-user text-teal-500"></i> {n.postedBy || n.author || 'Administrative'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{n.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">{n.content}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getCategoryBadgeClass(n.category)}`}>{n.category}</span>
                                    {n.priority?.toLowerCase() !== 'normal' && (
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getPriorityBadgeClass(n.priority)}`}>{n.priority}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-50 gap-4">
                                <button
                                    onClick={() => handleViewDetails(n)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <i className="fas fa-eye"></i> View Details
                                </button>
                                <div className="flex items-center gap-5 text-xs text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5"><i className="far fa-eye text-slate-300"></i> {n.views || 0} views</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Notice Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Notice Details"
                size="lg"
            >
                {selected && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getCategoryBadgeClass(selected.category)}`}>{selected.category}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getPriorityBadgeClass(selected.priority)}`}>{selected.priority}</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">{selected.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                <span className="flex items-center gap-1.5"><i className="far fa-calendar-alt text-blue-500"></i> {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="flex items-center gap-1.5"><i className="far fa-user text-teal-500"></i> {selected.postedBy || selected.author}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserNoticeBoard;
