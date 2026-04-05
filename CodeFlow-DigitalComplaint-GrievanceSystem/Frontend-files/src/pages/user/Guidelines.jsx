import { useState, useEffect } from 'react';
import guidelineService from '../../services/guidelineService';

const UserGuidelines = () => {
    const [guidelines, setGuidelines] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuidelines = async () => {
            try {
                const data = await guidelineService.getGuidelines();
                setGuidelines(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load guidelines:', error);
                setGuidelines([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGuidelines();
    }, []);

    const filtered = guidelines.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.rules.some(r => r.text.toLowerCase().includes(search.toLowerCase()) || r.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-bold">Accessing University Policy Hub...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Page Header (Perfectly Mirrored from Admin) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Guidelines</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Official policies and procedural documentation for students</p>
                </div>

                <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-700">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200">
                        <i className="fas fa-download"></i> Download Handbook
                    </button>
                    <button className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                        <i className="fas fa-print mr-2"></i> Print View
                    </button>
                </div>
            </div>

            {/* Banner Section (Mirrored Admin Color Scheme) */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[32px] p-8 text-white mb-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-white/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/30">
                        <i className="fas fa-book-open"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Governance SOP Hub</h2>
                        <p className="text-blue-100 max-w-xl leading-relaxed">
                            Understanding these guidelines ensures your grievances are handled with the
                            highest standards of institutional integrity and transparency.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search guidelines, rules, or procedures..."
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-200 rounded-[24px] text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                        />
                    </div>

                    {/* Guidelines List (Mirrored Card Styles) */}
                    <div className="space-y-6">
                        {filtered.map((cat) => (
                            <div key={cat.id} className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50 text-slate-800`}>
                                        <i className={`fas ${cat.icon}`}></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{cat.title}</h3>
                                        <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{cat.countLabel}</span>
                                    </div>
                                </div>
                                <div className="p-2 pb-4">
                                    {cat.rules.map((rule, ridx) => (
                                        <div key={rule.id} className="group p-5 hover:bg-slate-50 rounded-2xl transition-all flex items-start gap-5">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 text-sm font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {ridx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{rule.subtitle}</h4>
                                                <p className="text-slate-500 text-sm leading-relaxed">{rule.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar (Synchronized with Admin) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-circle-info"></i>
                            </div>
                            <h3 className="font-bold text-slate-900">Policy Updates</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Verified</p>
                                    <p className="text-slate-900 font-bold">Feb 25, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-stamp"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issuing Authority</p>
                                    <p className="text-slate-900 font-bold">University IQAC</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
                                <i className="fas fa-headset text-blue-500"></i> Need Assistance?
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all text-slate-600 font-bold text-sm">
                                    <span>Contact Support</span>
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 font-bold text-sm">
                                    <span>FAQs</span>
                                    <i className="fas fa-external-link-alt text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGuidelines;
