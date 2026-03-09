import { useState, useEffect } from 'react';
import guidelineService from '../../services/guidelineService';

const AdminGuidelines = () => {
    const [guidelines, setGuidelines] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGuideline, setNewGuideline] = useState({ category: '', subtitle: '', text: '' });
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

    const handleAdd = () => {
        if (!newGuideline.category || !newGuideline.subtitle || !newGuideline.text) {
            alert('Please fill all fields');
            return;
        }
        const updated = guidelineService.saveGuideline(newGuideline.category, {
            subtitle: newGuideline.subtitle,
            text: newGuideline.text
        });
        setGuidelines(updated);
        setIsModalOpen(false);
        setNewGuideline({ category: '', subtitle: '', text: '' });
    };

    const filtered = guidelines.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.rules.some(r => r.text.toLowerCase().includes(search.toLowerCase()) || r.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Governance SOPs...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Page Header (Mirrored from HTML) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Guidelines</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage and generate student-facing governance policies</p>
                </div>

                <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-700">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
                    >
                        <i className="fas fa-plus"></i> Add New SOP
                    </button>
                    <button className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                        <i className="fas fa-print mr-2"></i> Print Manual
                    </button>
                </div>
            </div>

            {/* Banner Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[32px] p-8 text-white mb-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-white/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/30">
                        <i className="fas fa-shield-halved animate-pulse"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Governance SOP Engine</h2>
                        <p className="text-blue-100 max-w-xl leading-relaxed">
                            These guidelines define the operational standards for the Code Flow system.
                            Updating these will reflect immediately on the student-facing portal.
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

                    {/* Guidelines List */}
                    <div className="space-y-6">
                        {filtered.map((cat, idx) => (
                            <div key={cat.id} className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50 text-slate-800`}>
                                            <i className={`fas ${cat.icon}`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{cat.title}</h3>
                                            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{cat.countLabel}</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                                <div className="p-2">
                                    {cat.rules.map((rule, ridx) => (
                                        <div key={rule.id} className="group p-5 hover:bg-slate-50 rounded-2xl transition-all flex items-start gap-5">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
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

                {/* Sidebar Widgets (Mirrored from HTML) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Info */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-circle-info"></i>
                            </div>
                            <h3 className="font-bold text-slate-900">Governance Pulse</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-calendar"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Modified</p>
                                    <p className="text-slate-900 font-bold">Feb 25, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-user-edit"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Editor</p>
                                    <p className="text-slate-900 font-bold">Admin (Superuser)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-fingerprint"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</p>
                                    <p className="text-slate-900 font-bold">PRO-2.4.0</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Links</h4>
                            <div className="space-y-2">
                                {['Student Handbook', 'Academic Calendar', 'Privacy Policy'].map(link => (
                                    <button key={link} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-medium">
                                        <span>{link}</span>
                                        <i className="fas fa-arrow-right text-xs"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal (Modified from HTML logic) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-xl relative flex flex-col shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-[40px]">
                            <h2 className="text-2xl font-black text-slate-900">Generate New SOP</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Policy Category</label>
                                <select
                                    className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                    value={newGuideline.category}
                                    onChange={e => setNewGuideline({ ...newGuideline, category: e.target.value })}
                                >
                                    <option value="">Select a category...</option>
                                    <option value="General Grievance Submission">General Grievance Submission</option>
                                    <option value="Response & Resolution Time">Response & Resolution Time</option>
                                    <option value="Privacy & Confidentiality">Privacy & Confidentiality</option>
                                    <option value="New Category">+ Create New Category</option>
                                </select>
                            </div>
                            {newGuideline.category === 'New Category' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                                    <input
                                        className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                                        placeholder="e.g. Legal Compliance"
                                        onChange={e => setNewGuideline({ ...newGuideline, category: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Standard Heading</label>
                                <input
                                    className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. Resolution Deadlines"
                                    value={newGuideline.subtitle}
                                    onChange={e => setNewGuideline({ ...newGuideline, subtitle: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Procedure Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Provide detailed instruction for students..."
                                    value={newGuideline.text}
                                    onChange={e => setNewGuideline({ ...newGuideline, text: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-8 pt-0 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex-[2] py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            >
                                Publish Guideline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGuidelines;
