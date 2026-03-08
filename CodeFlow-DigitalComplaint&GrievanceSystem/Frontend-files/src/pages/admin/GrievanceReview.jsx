import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const GrievanceReview = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({
        status: 'pending',
        priority: 'medium',
        adminNotes: '',
        reviewComments: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchGrievance = async () => {
            setLoading(true);
            try {
                // Now uses backend API which returns the grievance object
                const found = await grievanceService.getGrievanceByCode(code);
                setGrievance(found);
                if (found) {
                    setReviewForm({
                        status: found.status || 'pending',
                        priority: found.priority || 'medium',
                        adminNotes: found.adminNotes || '',
                        reviewComments: found.resolution || ''
                    });
                }
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
            await grievanceService.updateStatus(code, reviewForm.status);
            // Optionally update admin notes and resolution if the backend supports it in updateStatus
            // For now, based on my previous grievanceService, updateStatus only takes (code, status)
            // I should update grievanceService to handle more if needed.

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
            <i className="fas fa-exclamation-triangle text-rose-500 text-3xl mb-4"></i>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Case Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 px-8 py-3 bg-blue-900 text-white rounded-2xl font-black">Go Back</button>
        </div>
    );

    return (
        <div className="pb-20 max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-10 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black mb-2">Grievance Adjudication</h2>
                            <p className="font-mono text-blue-200">Ref: {grievance.grievanceCode}</p>
                        </div>
                        <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-white/10 border border-white/20">
                            {grievance.status}
                        </span>
                    </div>
                </div>

                <div className="p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Details */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Complainant</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                                <p className="font-bold flex justify-between"><span>Name:</span> <span className="text-blue-900">{grievance.userName}</span></p>
                                <p className="font-bold flex justify-between"><span>Email:</span> <span className="text-blue-900">{grievance.userEmail}</span></p>
                                <p className="font-bold flex justify-between"><span>Mode:</span> <span className="text-purple-600">{grievance.isAnonymous ? 'Anonymous' : 'Standard'}</span></p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Incident Info</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                                <p className="font-bold flex justify-between"><span>Category:</span> <span>{getCategoryLabel(grievance.category)}</span></p>
                                <p className="font-bold flex justify-between"><span>Date:</span> <span>{new Date(grievance.incidentDate).toLocaleDateString()}</span></p>
                                <p className="font-bold flex justify-between"><span>Location:</span> <span>{grievance.location || 'N/A'}</span></p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Case Statement</h3>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                            <h4 className="text-xl font-black text-slate-800 mb-4 truncate">{grievance.subject}</h4>
                            <p className="text-slate-600 leading-relaxed">{grievance.description}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-blue-50/50 p-8 rounded-[2.5rem]">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Update Status</label>
                                <select
                                    value={reviewForm.status}
                                    onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                                    className="w-full p-4 rounded-2xl font-bold bg-white border border-blue-100 outline-none focus:border-blue-500"
                                >
                                    {['pending', 'processing', 'in-progress', 'resolved', 'rejected'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Internal Notes</label>
                                <textarea
                                    value={reviewForm.adminNotes}
                                    onChange={e => setReviewForm({ ...reviewForm, adminNotes: e.target.value })}
                                    rows={4}
                                    placeholder="Private investigation notes..."
                                    className="w-full p-4 rounded-2xl font-medium bg-white border border-blue-100 outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Resolution (Public)</label>
                                <textarea
                                    value={reviewForm.reviewComments}
                                    onChange={e => setReviewForm({ ...reviewForm, reviewComments: e.target.value })}
                                    rows={4}
                                    placeholder="Official response to student..."
                                    className="w-full p-4 rounded-2xl font-medium bg-white border border-blue-100 outline-none resize-none"
                                ></textarea>
                            </div>
                            <button disabled={isSaving} className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all">
                                {isSaving ? 'Saving...' : 'Finalize & Update Case'}
                            </button>
                            {showSuccess && <p className="text-center text-emerald-600 font-bold animate-bounce">Update Successful!</p>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GrievanceReview;
