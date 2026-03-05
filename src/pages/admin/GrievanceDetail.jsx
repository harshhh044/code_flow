import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const AdminGrievanceDetail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrievance = async () => {
            setLoading(true);
            try {
                const found = await grievanceService.getGrievanceByCode(code);
                setGrievance(found);
            } catch (error) {
                console.error('Failed to fetch grievance details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrievance();
    }, [code]);

    const getCategoryLabel = (val) => {
        return CATEGORIES.find(c => c.value === val)?.label || val;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold">Fetching comprehensive case details...</p>
            </div>
        );
    }

    if (!grievance) return (
        <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-exclamation-triangle text-3xl text-rose-500"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Case Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">The grievance record you're looking for doesn't exist or has been removed from the system.</p>
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-blue-900 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                Go Back to List
            </button>
        </div>
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="pb-10 max-w-5xl mx-auto">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Case Details</h1>
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">{grievance.code}</span>
                            • Viewing full grievance dossier
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center gap-2">
                        <i className="fas fa-print"></i>
                        <span>Print</span>
                    </button>
                    <Link
                        to={`/admin/review/${grievance.code}`}
                        className="flex-1 sm:flex-none px-8 py-3 bg-blue-900 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                    >
                        Process Report
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Grievance Summary Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest ${getStatusStyles(grievance.status)}`}>
                                {grievance.status}
                            </span>
                            <span className="text-xs font-black text-slate-400 capitalize bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                {getCategoryLabel(grievance.category)}
                            </span>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">{grievance.subject}</h2>

                        <div className="flex flex-wrap gap-6 text-slate-500 text-xs font-bold mb-8">
                            <span className="flex items-center gap-2"><i className="fas fa-calendar-alt text-blue-500"></i> Submitted: {new Date(grievance.submissionDate || grievance.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="flex items-center gap-2 uppercase tracking-wider"><i className="fas fa-flag text-rose-500"></i> Priority: {grievance.priority || 'Normal'}</span>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <i className="fas fa-align-left text-blue-500"></i> Detailed Description
                            </h3>
                            <p className="text-slate-700 text-sm leading-[1.8] font-medium whitespace-pre-line">
                                {grievance.description}
                            </p>
                        </div>
                    </div>

                    {/* Complainant Profile */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <i className="fas fa-user-circle text-blue-600"></i>
                            Complainant Information
                        </h3>

                        {grievance.isAnonymous ? (
                            <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-3xl">
                                    <i className="fas fa-user-secret"></i>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-purple-900 mb-1">Anonymous Submission</h4>
                                    <p className="text-purple-700 text-sm font-medium opacity-80">This student chose to hide their identity to protect themselves. Please respect this privacy during the investigation.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Full Name', value: grievance.first_name || 'Not Provided', icon: 'fa-user' },
                                    { label: 'Student ID', value: grievance.student_id || 'Not Provided', icon: 'fa-id-card' },
                                    { label: 'Email Address', value: grievance.email || 'Not Provided', icon: 'fa-envelope' },
                                    { label: 'Contact Number', value: grievance.phone || 'Not Provided', icon: 'fa-phone' },
                                    { label: 'Course/Year', value: grievance.course_year || 'Not Provided', icon: 'fa-graduation-cap' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                            <i className={`fas ${item.icon} text-sm`}></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                            <p className="text-sm font-black text-slate-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Evidence & Attachments */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <i className="fas fa-paperclip text-blue-600"></i>
                            Supporting Evidence
                        </h3>

                        {!grievance.attachments || grievance.attachments.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <i className="fas fa-file-circle-minus text-3xl text-slate-300 mb-3"></i>
                                <p className="text-slate-400 font-bold">No evidence attached to this case</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {grievance.attachments.map((file, idx) => (
                                    <div key={idx} className="group bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 hover:border-blue-300 hover:bg-white transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${file.type?.includes('pdf') ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <i className={`fas ${file.type?.includes('pdf') ? 'fa-file-pdf' : 'fa-file-image'}`}></i>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-black text-slate-800 truncate">{file.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{file.size}</p>
                                            </div>
                                        </div>
                                        {file.dataUrl && (
                                            <a href={file.dataUrl} download={file.name} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <i className="fas fa-download text-sm"></i>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Status/Action Panel */}
                <div className="space-y-8">
                    {/* Case Status Sidebar */}
                    <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full"></div>

                        <h3 className="text-[10px] font-black text-blue-200/60 uppercase tracking-[0.2em] mb-6">Internal Management</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3 opacity-60">Report Action</label>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate(`/admin/review/${grievance.code}`)}
                                        className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black text-sm hover:bg-blue-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <i className="fas fa-file-export"></i> Open Review Portal
                                    </button>
                                    <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                                        <i className="fas fa-envelope"></i> Message Student
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-200 opacity-60 font-bold">Reviewer</span>
                                    <span className="font-black">Super Admin</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-200 opacity-60 font-bold">Last Activity</span>
                                    <span className="font-black">2 hours ago</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-200 opacity-60 font-bold">Response Due</span>
                                    <span className="font-black">In 48 Hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Notes Mockup */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h4 className="text-[10px] font-black text-blue-200/60 uppercase tracking-widest mb-4">Internal Flags</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-500/30">Urgent</span>
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30">Legal Risk</span>
                            </div>
                        </div>
                    </div>

                    {/* Incident Context */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <i className="fas fa-map-marker-alt text-blue-600"></i>
                            Incident Context
                        </h3>

                        <div className="space-y-4">
                            {[
                                { label: 'Location', value: grievance.location || 'Not Specified', icon: 'fa-compass' },
                                { label: 'Involvement', value: grievance.involvement || 'Directly Involved', icon: 'fa-users' },
                                { label: 'Witnesses', value: grievance.witnesses || 'None Noted', icon: 'fa-eye' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-1">
                                        <i className={`fas ${item.icon} text-slate-400 text-[10px]`}></i>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    </div>
                                    <p className="text-xs font-black text-slate-800 ml-5 capitalize">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGrievanceDetail;

