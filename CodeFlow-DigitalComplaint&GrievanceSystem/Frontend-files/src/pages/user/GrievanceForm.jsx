import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const GrievanceForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=form, 2=review, 3=success
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [witnesses, setWitnesses] = useState('no');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [captcha, setCaptcha] = useState({ q: '', a: 0, userAns: '' });
    const [submittedCode, setSubmittedCode] = useState('');
    const [isDraft, setIsDraft] = useState(false);

    const [form, setForm] = useState({
        fullName: user?.fullName || user?.name || '',
        rollNo: user?.studentId || user?.uid || '',
        uniEmail: user?.email || '',
        personalEmail: user?.personalEmail || '',
        courseYear: '',
        phone: '',
        incidentDate: '',
        incidentTime: '',
        involvement: '',
        location: '',
        category: '',
        subject: '',
        description: '',
        witnessInfo: '',
        resolutionNotes: '',
    });

    useEffect(() => {
        const draft = localStorage.getItem('grievanceDraft');
        if (draft) {
            try {
                const d = JSON.parse(draft);
                setForm(prev => ({ ...prev, ...d }));
                setIsDraft(true);
            } catch { }
        }
    }, [user]);

    useEffect(() => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ q: `${n1} + ${n2} = ?`, a: n1 + n2, userAns: '' });
    }, [step]);

    useEffect(() => {
        if (form.category === 'Harassment/Ragging' && !isAnonymous) {
            if (window.confirm('⚠️ This is a sensitive category. We strongly recommend submitting anonymously to protect your identity. Enable anonymous mode?')) {
                setIsAnonymous(true);
            }
        }
    }, [form.category, isAnonymous]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is too large (max 10MB)`); return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUploadedFiles(prev => [...prev, { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', type: file.type, dataUrl: ev.target.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleReview = () => {
        if (!form.category || !form.subject || !form.description || !form.incidentDate || !form.resolutionNotes) {
            alert('Please fill all required fields.'); return;
        }
        if (!isAnonymous && (!form.fullName || !form.uniEmail)) {
            alert('Please fill personal information.'); return;
        }
        if (isAnonymous && parseInt(captcha.userAns) !== captcha.a) {
            alert('Incorrect CAPTCHA answer. Please try again.'); return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        const grievanceData = {
            userName: isAnonymous ? 'Anonymous' : form.fullName,
            userEmail: isAnonymous ? 'anonymous@codeflow.edu' : form.uniEmail,
            isAnonymous,
            category: form.category,
            subject: form.subject,
            description: form.description,
            incidentDate: form.incidentDate,
            location: form.location,
            witnessInfo: form.witnessInfo,
            resolutionNotes: form.resolutionNotes
        };

        try {
            const result = await grievanceService.submitGrievance(grievanceData, isAnonymous);
            localStorage.removeItem('grievanceDraft');
            setSubmittedCode(result.grievanceCode);
            setStep(3);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Submission failed. Please try again.');
        }
    };

    const saveDraft = () => {
        localStorage.setItem('grievanceDraft', JSON.stringify(form));
        alert('Draft saved successfully!');
    };

    if (step === 3) return (
        <div className="max-w-lg mx-auto mt-16 text-center">
            <div className="bg-white rounded-3xl p-10 shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg">
                    <i className="fas fa-check"></i>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Submitted!</h2>
                <div className="bg-gradient-to-r from-blue-900 to-teal-600 text-white text-2xl font-extrabold py-4 px-8 rounded-2xl mb-4 tracking-widest">
                    {submittedCode}
                </div>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigator.clipboard?.writeText(submittedCode)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm">Copy Code</button>
                    <button onClick={() => navigate('/user/grievances')} className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm">My Dashboard</button>
                </div>
            </div>
        </div>
    );

    if (step === 2) return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <h2 className="text-2xl font-bold border-b pb-4">Review Your Grievance</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Subject</p>
                        <p className="font-semibold">{form.subject}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Description</p>
                        <p className="text-sm">{form.description}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Identity</p>
                        <p className="font-semibold text-blue-600">{isAnonymous ? 'Anonymous' : form.fullName}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 rounded-xl font-bold">Edit</button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold">Submit Now</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border">
            <h2 className="text-3xl font-black mb-6">Submit Grievance</h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <label className="font-bold">Anonymous Mode</label>
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-5 h-5 accent-blue-900" />
                </div>

                {!isAnonymous && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="email" placeholder="Email" value={form.uniEmail} onChange={e => setForm({ ...form, uniEmail: e.target.value })} className="p-3 border rounded-xl" />
                    </div>
                )}

                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-3 border rounded-xl">
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full p-3 border rounded-xl" />

                <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="w-full p-3 border rounded-xl resize-none"></textarea>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400">Incident Date</label>
                        <input type="date" value={form.incidentDate} onChange={e => setForm({ ...form, incidentDate: e.target.value })} className="w-full p-3 border rounded-xl" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400">Location</label>
                        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full p-3 border rounded-xl" />
                    </div>
                </div>

                <textarea placeholder="Desired Resolution" value={form.resolutionNotes} onChange={e => setForm({ ...form, resolutionNotes: e.target.value })} rows={2} className="w-full p-3 border rounded-xl resize-none"></textarea>

                {isAnonymous && (
                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                        <p className="font-bold text-sm mb-2">{captcha.q}</p>
                        <input type="number" value={captcha.userAns} onChange={e => setCaptcha({ ...captcha, userAns: e.target.value })} className="w-20 p-2 border rounded text-center" />
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={saveDraft} className="flex-1 py-4 border-2 rounded-2xl font-bold">Save Draft</button>
                    <button onClick={handleReview} className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-bold">Review & Submit</button>
                </div>
            </div>
        </div>
    );
};

export default GrievanceForm;
