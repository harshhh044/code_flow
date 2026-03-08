import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

const GrievanceDetail = () => {
    const { code } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchGrievance = () => {
            const db = JSON.parse(localStorage.getItem('grievanceDatabase') || '{}');
            const foundGrievance = Object.values(db).flat().find(g => g.code === code);

            if (foundGrievance) {
                setGrievance(foundGrievance);
            }
            setLoading(false);
        };

        fetchGrievance();
    }, [code]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!grievance) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Grievance Not Found</h2>
                <p className="text-slate-500 mb-8">The grievance code <span className="font-mono font-bold text-blue-700">{code}</span> does not exist in our records.</p>
                <Link to="/user/grievances" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold transition-all hover:bg-blue-800">
                    <i className="fas fa-arrow-left"></i> Back to My Grievances
                </Link>
            </div>
        );
    }

    // Default timeline if none exists
    const timeline = grievance.timeline || [
        { title: 'Grievance Submitted', date: new Date(grievance.submissionDate || grievance.date).toLocaleString(), desc: 'Your grievance has been successfully logged.', completed: true },
        { title: 'Initial Review', date: 'Processing', desc: 'Warden/Admin is reviewing the complaint.', active: true },
        { title: 'Processing', date: 'Pending', desc: 'Action being taken on the grievance.', completed: false },
        { title: 'Final Resolution', date: 'Pending', desc: 'Closure of the grievance.', completed: false }
    ];

    return (
        <div className="min-h-screen bg-transparent pb-10">
            {/* Back Link */}
            <Link
                to={`/user/list?category=${encodeURIComponent(grievance.category)}`}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-bold mb-6 transition-colors group"
            >
                <i className="fas fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
                Back to {grievance.category}
            </Link>

            {/* Page Title */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm text-blue-700 flex items-center justify-center text-xl border border-blue-50">
                    <i className="fas fa-file-alt"></i>
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Grievance Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User Details Section */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-lg font-black text-slate-800">User Details</h2>
                            <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex gap-3">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">Name:</span>
                                        <span className="text-slate-700 font-black text-sm">{user?.name || 'Gaurav Singh'}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">Course:</span>
                                        <span className="text-slate-700 font-black text-sm">{user?.course || 'B.C.A (AI & DS)'}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">Roll No:</span>
                                        <span className="text-slate-700 font-black text-sm">{user?.rollNo || '2401201183'}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">Phone:</span>
                                        <span className="text-slate-700 font-black text-sm">{user?.phone || '9953304840'}</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="flex gap-3">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">Email:</span>
                                        <span className="text-slate-700 font-black text-sm truncate">{user?.email || 'gauravsingh17062006@gmail.com'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-24 h-24 bg-blue-50 rounded-[24px] flex items-center justify-center text-4xl text-blue-700 border-2 border-white shadow-xl">
                                <i className="fas fa-user-graduate"></i>
                            </div>
                        </div>
                    </div>

                    {/* Grievance Summary Section */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-lg font-black text-slate-800">Grievance Details</h2>
                            <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">
                                    {grievance.subject || 'Complaint Subject'}
                                </h3>
                                <p className="text-blue-700 font-mono font-black tracking-widest text-xs uppercase">
                                    Code: {grievance.code}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(grievance.status)} ring-4 ring-offset-0 ring-opacity-20`}>
                                {grievance.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 py-6 border-y border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                                <p className="text-sm font-black text-slate-700">{new Date(grievance.submissionDate || grievance.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                <p className="text-sm font-black text-slate-700">{grievance.category || 'General'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                <p className="text-sm font-black text-slate-700">{grievance.department || grievance.category}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                {grievance.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 bg-blue-50 text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all shadow-blue-900/10 active:scale-95 border-2 border-blue-100"
                            >
                                View Detailed Information
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status/Timeline */}
                <div className="space-y-8">
                    {/* Progress Timeline */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-8">
                            <h2 className="text-lg font-black text-slate-800">Progress Tracker</h2>
                            <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-slate-100"></div>

                            {timeline.map((item, idx) => (
                                <div key={idx} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${item.completed ? 'bg-green-500' : item.active ? 'bg-blue-600 animate-pulse ring-4 ring-blue-100' : 'bg-slate-200'
                                        }`}>
                                        {item.completed && <i className="fas fa-check text-white text-[10px]"></i>}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={`text-xs font-black uppercase tracking-wider ${item.completed ? 'text-green-600' : item.active ? 'text-blue-700' : 'text-slate-400'}`}>
                                            {item.title}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 italic mb-1">{item.date}</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-10 p-2 bg-slate-50 rounded-2xl">
                            <button className="w-full py-4 rounded-xl font-black text-xs text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                                <i className="fas fa-exclamation-circle"></i> Escalate Issue
                            </button>
                            <button className="w-full py-4 rounded-xl font-black text-xs text-blue-700 hover:bg-blue-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                                <i className="fas fa-envelope"></i> Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    <div className="bg-white rounded-[40px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-50 border border-slate-200 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-slate-50 flex justify-between items-center z-20">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 leading-none mb-2">Detailed Inquiry</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Record: {grievance.code}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-xl"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-10 py-10 space-y-10">
                            {/* Description Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                                        <i className="fas fa-align-left text-sm"></i>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Full Description</h4>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-slate-600 text-sm font-medium leading-[1.8]">
                                        {grievance.description || 'No detailed description available.'}
                                    </p>
                                </div>
                            </section>

                            {/* Attachments Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                        <i className="fas fa-paperclip text-sm"></i>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Supporting Evidence</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Photo Evidence', 'Document.pdf', 'Video Clip'].map((item, i) => (
                                        <div key={i} className="group p-4 bg-white border-2 border-slate-50 rounded-2xl flex flex-col items-center text-center hover:border-blue-100 hover:bg-blue-50/20 transition-all cursor-pointer">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-3">
                                                <i className={`fas ${i === 0 ? 'fa-image' : i === 1 ? 'fa-file-pdf' : 'fa-film'}`}></i>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Case Review Download Section */}
                            <section className="bg-blue-900 rounded-[32px] p-8 shadow-2xl shadow-blue-900/30 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="text-center md:text-left">
                                        <p className="text-blue-200 text-[10px] font-black uppercase tracking-[4px] mb-2">Final Documentation</p>
                                        <h4 className="text-xl font-black mb-1">Grievance Case Review</h4>
                                        <p className="text-blue-100/60 text-xs font-medium">Download the complete formal record of this case.</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/user/review/${grievance.code}`)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-black/20"
                                    >
                                        <i className="fas fa-download"></i> EXPORT REVIEW
                                    </button>
                                </div>
                            </section>

                            {/* Admin Feedback Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                        <i className="fas fa-user-shield text-sm"></i>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Administration Response</h4>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px] border-l-[6px] border-blue-900">
                                    <p className="text-slate-500 text-sm font-bold italic mb-0">
                                        "{grievance.adminResponse || "Awaiting verification from the concerned department. Your issue has been marked as high priority."}"
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-6 bg-slate-50/50 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                This record is encrypted and verified by the Code Flow Digital Governance System
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrievanceDetail;
