import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const GrievanceReview = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({
        status: 'Pending',
        priority: 'Normal',
        adminNotes: '',
        reviewComments: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchGrievance = async () => {
            setLoading(true);
            try {
                const found = await grievanceService.getGrievanceByCode(code);
                setGrievance(found);
                setReviewForm({
                    status: found.status || 'Pending',
                    priority: found.priority || 'Normal',
                    adminNotes: found.adminNotes || '',
                    reviewComments: found.reviewComments || ''
                });
            } catch (error) {
                console.error('Failed to fetch grievance:', error);
                setGrievance(null);
            } finally {
                setLoading(false);
            }
        };
        fetchGrievance();
    }, [code]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await grievanceService.updateStatus(grievance._id, reviewForm); // ✅ Fixed: use _id not code
            setGrievance(prev => ({ ...prev, ...reviewForm }));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update grievance:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const getCategoryLabel = (val) => {
        return CATEGORIES.find(c => c.value === val)?.label || val;
    };

    if (loading) return (
        <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold">Loading Case Report...</p>
        </div>
    );

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

    return (
        <div className="pb-20 max-w-5xl mx-auto print:p-0">
            {/* Action Bar - Hidden on Print */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Case Review Report</h1>
                        <p className="text-slate-500 text-sm font-medium">Internal adjudication and decision portal</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => window.print()} className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 transition-all flex items-center gap-2">
                        <i className="fas fa-print"></i> Print Report
                    </button>
                    <button className="px-6 py-3 bg-blue-50 text-blue-700 border-2 border-blue-100 rounded-2xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2">
                        <i className="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>

            {/* Main Report Document */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
                {/* Branded Header */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 p-10 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                    <i className="fas fa-clipboard-check text-xl"></i>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Official Case Review</span>
                            </div>
                            <h2 className="text-4xl font-black mb-2 leading-tight">Grievance Adjudication<br />Technical Report</h2>
                            <p className="text-blue-200 font-medium max-w-md opacity-80">Reference ID: <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white ml-2">{grievance.code}</span></p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 bg-white/10`}>
                                {grievance.status}
                            </span>
                            <div className="text-[10px] font-bold text-blue-200 opacity-60">
                                <p>REPORT DATE</p>
                                <p className="text-white text-xs mt-0.5">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-12">
                    {/* Section 1: Case Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <i className="fas fa-user-shield text-blue-500"></i> Complainant Matrix
                            </h3>
                            {grievance.isAnonymous ? (
                                <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
                                    <div className="flex items-center gap-4 italic font-bold text-purple-700">
                                        <i className="fas fa-user-secret text-2xl"></i>
                                        <div>
                                            <p>IDENTITY PROTECTED</p>
                                            <p className="text-[10px] font-medium opacity-70">Anonymous submission via secure channel</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { label: 'NAME', value: grievance.first_name || grievance.submittedBy?.name },
                                        { label: 'STUDENT ID', value: grievance.student_id || grievance.submittedBy?.uid },
                                        { label: 'EMAIL', value: grievance.email || grievance.submittedBy?.email }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                            <span className="text-[10px] font-black text-slate-400">{item.label}</span>
                                            <span className="font-bold text-slate-700">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <i className="fas fa-info-circle text-blue-500"></i> Incident Overview
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'CATEGORY', value: getCategoryLabel(grievance.category) },
                                    { label: 'SUBMISSION', value: new Date(grievance.submissionDate || grievance.createdAt).toLocaleDateString() },
                                    { label: 'LOCATION', value: grievance.location || 'College Campus' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400">{item.label}</span>
                                        <span className="font-bold text-slate-700 capitalize">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Core Description */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <i className="fas fa-align-left text-blue-500"></i> Grievance Statement
                        </h3>
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                            <h4 className="text-xl font-black text-slate-800 mb-4">{grievance.subject || grievance.title}</h4>
                            <p className="text-slate-600 leading-[1.8] font-medium text-sm">
                                {grievance.description}
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Admin Adjudication Form */}
                    <div className="print:hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <i className="fas fa-gavel text-blue-500"></i> Administrative Decision
                            </h3>
                            {showSuccess && (
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full animate-bounce">
                                    <i className="fas fa-check-circle mr-2"></i> Report Updated Successfully
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border-2 border-blue-50 rounded-[2.5rem] p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Update Status</label>
                                        <select
                                            value={reviewForm.status}
                                            onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                        >
                                            {['Pending', 'Processing', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority Level</label>
                                        <select
                                            value={reviewForm.priority}
                                            onChange={e => setReviewForm({ ...reviewForm, priority: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                        >
                                            {['Low', 'Normal', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Internal Case Notes <span className="opacity-60">(Private)</span></label>
                                    <textarea
                                        rows={4}
                                        value={reviewForm.adminNotes}
                                        onChange={e => setReviewForm({ ...reviewForm, adminNotes: e.target.value })}
                                        placeholder="Internal investigation details, confidential notes, etc..."
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-blue-600">Response to Complainant <span className="opacity-60">(Public)</span></label>
                                    <textarea
                                        rows={8}
                                        value={reviewForm.reviewComments}
                                        onChange={e => setReviewForm({ ...reviewForm, reviewComments: e.target.value })}
                                        placeholder="Enter the official university response or resolution message that will be sent to the student..."
                                        className="w-full p-5 bg-blue-50/30 border-2 border-blue-50 focus:border-blue-500 focus:bg-white rounded-[2rem] text-sm font-medium transition-all outline-none resize-none shadow-inner"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-900/20 hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <i className="fas fa-circle-notch fa-spin"></i>
                                            Processing Final Report...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i>
                                            Seal & Save Decision
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 4: Print/Final Report View */}
                    <div className="hidden print:block space-y-8 mt-10">
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Official Resolution Message</h3>
                            <p className="text-slate-800 font-bold text-sm leading-relaxed p-6 bg-white rounded-2xl border border-slate-100">
                                {reviewForm.reviewComments || 'No public response has been filed yet for this grievance.'}
                            </p>
                        </div>

                        <div className="flex justify-between items-end pt-20">
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-slate-800 mb-2"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ADMINISTRATOR SIGNATURE</p>
                            </div>
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-slate-800 mb-2"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">SYSTEM VERIFICATION MARK</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-10 px-10 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">
                <p>© 2026 UNIVERSITY GRIEVANCE COMMISION</p>
                <p>CONFIDENTIAL : FOR INTERNAL USE ONLY</p>
            </div>
        </div>
    );
};

export default GrievanceReview;
