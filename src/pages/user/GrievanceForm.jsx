import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
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
        fullName: user?.name || '',
        rollNo: user?.studentId || '',
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
    }, []);

    useEffect(() => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ q: `${n1} + ${n2} = ?`, a: n1 + n2, userAns: '' });
    }, []);

    useEffect(() => {
        if (form.category === 'Harassment/Ragging' && !isAnonymous) {
            if (window.confirm('⚠️ This is a sensitive category. We strongly recommend submitting anonymously to protect your identity. Enable anonymous mode?')) {
                setIsAnonymous(true);
            }
        }
    }, [form.category]);

    // Categories removed as we use the one from constants.js

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

    const generateCode = () => {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return isAnonymous ? `ANON-${year}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` : `GRV-${year}-${rand}`;
    };

    const handleReview = () => {
        if (!form.category || !form.subject || !form.description || !form.incidentDate || !form.resolutionNotes) {
            alert('Please fill all required fields.'); return;
        }
        if (!isAnonymous && (!form.fullName || !form.rollNo || !form.uniEmail)) {
            alert('Please fill personal information.'); return;
        }
        if (isAnonymous && parseInt(captcha.userAns) !== captcha.a) {
            alert('Incorrect CAPTCHA answer. Please try again.'); return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        const grievanceData = {
            // User fields (for matching)
            fullName: form.fullName,
            rollNo: form.rollNo,
            uniEmail: form.uniEmail,
            personalEmail: form.personalEmail,
            email: isAnonymous ? 'anonymous@system.local' : form.uniEmail, // Primary email for matching
            courseYear: form.courseYear,
            phone: form.phone,
            incidentDate: form.incidentDate,
            incidentTime: form.incidentTime,
            involvement: form.involvement,
            location: form.location,
            category: form.category,
            subject: form.subject,
            description: form.description,
            witnesses,
            witnessInfo: form.witnessInfo,
            resolutionNotes: form.resolutionNotes,
            attachments: uploadedFiles,

            // Explicit field mapping for admin listing compatibility
            first_name: isAnonymous ? 'Anonymous Student' : form.fullName,
            student_id: isAnonymous ? 'ANON' : form.rollNo,
            course_year: isAnonymous ? 'Not disclosed' : form.courseYear,
            incident_date: form.incidentDate,
            incident_time: form.incidentTime,
            witness_info: form.witnessInfo,
            resolution_notes: form.resolutionNotes
        };

        try {
            const result = await grievanceService.submitGrievance(grievanceData, isAnonymous);
            localStorage.removeItem(STORAGE_KEYS.DRAFT);
            setSubmittedCode(result.code);
            setStep(3);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Submission failed. Please try again.');
        }
    };

    const saveDraft = () => {
        localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(form));
        alert('Draft saved successfully!');
    };

    if (step === 3) return (
        <div className="max-w-lg mx-auto mt-16 text-center">
            <div className="bg-white rounded-3xl p-10 shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg">
                    <i className="fas fa-check"></i>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                    {isAnonymous ? 'Anonymous Complaint Submitted!' : 'Grievance Submitted Successfully!'}
                </h2>
                <p className="text-slate-500 mb-6">{isAnonymous ? 'Your identity is completely protected. Save this tracking code securely:' : 'Your Grievance Code:'}</p>
                <div className="bg-gradient-to-r from-blue-900 to-teal-600 text-white text-2xl font-extrabold py-4 px-8 rounded-2xl mb-4 tracking-widest">
                    {submittedCode}
                </div>
                <p className="text-xs text-slate-500 mb-6">Save this code for future reference</p>
                {isAnonymous && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                        <p className="text-amber-800 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i><strong>Warning:</strong> If you lose this code, it CANNOT be recovered!</p>
                    </div>
                )}
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigator.clipboard?.writeText(submittedCode)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                        <i className="fas fa-copy mr-2"></i>Copy Code
                    </button>
                    <button onClick={() => navigate('/user/status')} className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                        Track Status <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );

    if (step === 2) return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-teal-600 p-6 text-white">
                    <h2 className="text-xl font-bold">Review Your Grievance</h2>
                    <p className="text-sm opacity-90 mt-1">Please review all details before submitting</p>
                </div>
                <div className="p-6 space-y-4">
                    {isAnonymous && (
                        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
                            <i className="fas fa-user-secret text-purple-600 text-xl"></i>
                            <div><p className="font-semibold text-purple-800 text-sm">Anonymous Submission</p>
                                <p className="text-xs text-purple-600">Your identity will be protected</p></div>
                        </div>
                    )}
                    {!isAnonymous && (
                        <div>
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-500 text-xs">Name</p><p className="font-semibold text-slate-800">{form.fullName}</p></div>
                                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-500 text-xs">Roll No</p><p className="font-semibold text-slate-800">{form.rollNo}</p></div>
                                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-500 text-xs">Email</p><p className="font-semibold text-slate-800 truncate">{form.uniEmail}</p></div>
                                <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-500 text-xs">Course/Year</p><p className="font-semibold text-slate-800">{form.courseYear}</p></div>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Grievance Details</h4>
                        <div className="space-y-2">
                            {[['Category', form.category], ['Subject', form.subject], ['Incident Date', form.incidentDate], ['Location', form.location]].map(([k, v]) => (
                                <div key={k} className="flex justify-between bg-slate-50 rounded-lg p-3 text-sm">
                                    <span className="text-slate-500">{k}</span>
                                    <span className="font-semibold text-slate-800">{v}</span>
                                </div>
                            ))}
                            <div className="bg-slate-50 rounded-lg p-3 text-sm">
                                <p className="text-slate-500 text-xs mb-1">Description</p>
                                <p className="text-slate-800">{form.description}</p>
                            </div>
                        </div>
                    </div>
                    {uploadedFiles.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Attachments ({uploadedFiles.length})</h4>
                            {uploadedFiles.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 py-1">
                                    <i className="fas fa-paperclip text-blue-500"></i>{f.name} ({f.size})
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                        <i className="fas fa-edit mr-2"></i>Edit
                    </button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                        <i className="fas fa-paper-plane mr-2"></i>Submit Grievance
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
                {['Fill Form', 'Review', 'Done'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= step ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
                        <span className={`text-sm font-medium ${i + 1 <= step ? 'text-blue-900' : 'text-slate-400'}`}>{s}</span>
                        {i < 2 && <div className={`flex-1 h-1 rounded-full ${i + 1 < step ? 'bg-blue-700' : 'bg-slate-200'}`}></div>}
                    </div>
                ))}
            </div>

            {isDraft && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm">
                    <i className="fas fa-save"></i> Draft loaded. <button onClick={() => { localStorage.removeItem('grievanceDraft'); setIsDraft(false); }} className="underline ml-1">Clear draft</button>
                </div>
            )}

            {/* Anonymous Toggle */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isAnonymous ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                            <i className={`fas ${isAnonymous ? 'fa-user-secret' : 'fa-user'}`}></i>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{isAnonymous ? 'Anonymous Mode' : 'Anonymous Mode'}</p>
                            <p className="text-xs text-slate-500">Hide your identity for sensitive complaints</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                        <div className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-purple-600' : 'bg-slate-200'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ml-0.5 ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>
                {isAnonymous && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-700">
                        <i className="fas fa-shield-alt mr-2"></i>Your identity will be completely hidden. Only the grievance details will be recorded.
                    </div>
                )}
            </div>

            {/* Personal Info */}
            {!isAnonymous && (
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center"><i className="fas fa-user"></i></div>
                        <div><h3 className="font-bold text-slate-800">Personal Information</h3><p className="text-xs text-slate-500">Your identity details</p></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[['fullName', 'Full Name', 'text', 'John Doe', true], ['rollNo', 'Roll Number / Student ID', 'text', 'CS2023001', true], ['uniEmail', 'University Email', 'email', 'student@university.edu', true], ['personalEmail', 'Personal Email', 'email', 'personal@gmail.com', true], ['courseYear', 'Course & Year', 'text', 'B.Tech - 3rd Year', true], ['phone', 'Phone Number', 'tel', '+91 9876543210', true]].map(([id, label, type, placeholder, req]) => (
                            <div key={id}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">{label} {req && <span className="text-red-500">*</span>}</label>
                                <input type={type} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })} required={req} placeholder={placeholder} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Incident Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><i className="fas fa-calendar-alt"></i></div>
                    <div><h3 className="font-bold text-slate-800">Incident Details</h3><p className="text-xs text-slate-500">When and where it happened</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Incident Date <span className="text-red-500">*</span></label>
                        <input type="date" value={form.incidentDate} onChange={e => setForm({ ...form, incidentDate: e.target.value })} required className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Incident Time</label>
                        <input type="time" value={form.incidentTime} onChange={e => setForm({ ...form, incidentTime: e.target.value })} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Your Involvement <span className="text-red-500">*</span></label>
                        <select value={form.involvement} onChange={e => setForm({ ...form, involvement: e.target.value })} required className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                            <option value="">Select involvement</option>
                            <option>Direct Victim</option>
                            <option>Witness</option>
                            <option>Third-party reporting</option>
                            <option>On behalf of a group</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g., Main Building, Room 101" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                </div>
            </div>

            {/* Grievance Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><i className="fas fa-file-alt"></i></div>
                    <div><h3 className="font-bold text-slate-800">Grievance Details</h3><p className="text-xs text-slate-500">Describe your issue</p></div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subject: e.target.options[e.target.selectedIndex]?.text || form.subject })} required className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Brief subject of your grievance" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required minLength={50} rows={5} placeholder="Please provide a comprehensive description of your grievance..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" />
                        <p className="text-xs text-slate-400 mt-1">Minimum 50 characters ({form.description.length}/50)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Were there any witnesses?</label>
                        <div className="flex gap-4">
                            {['yes', 'no'].map(v => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="witnesses" value={v} checked={witnesses === v} onChange={() => setWitnesses(v)} className="text-blue-700" />
                                    <span className="text-sm font-medium text-slate-700 capitalize">{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {witnesses === 'yes' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Witness Details</label>
                            <textarea value={form.witnessInfo} onChange={e => setForm({ ...form, witnessInfo: e.target.value })} rows={3} placeholder="Names and contact details of witnesses" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Desired Resolution <span className="text-red-500">*</span></label>
                        <textarea value={form.resolutionNotes} onChange={e => setForm({ ...form, resolutionNotes: e.target.value })} required rows={3} placeholder="What outcome would resolve this grievance?" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" />
                    </div>
                </div>

                {/* CAPTCHA for Anonymous */}
                {isAnonymous && (
                    <div className="mt-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
                        <i className="fas fa-robot text-blue-700 text-2xl mb-2 block"></i>
                        <p className="text-sm text-slate-600 mb-3">Security Verification</p>
                        <p className="font-bold text-slate-800 mb-2">{captcha.q}</p>
                        <input type="number" value={captcha.userAns} onChange={e => setCaptcha({ ...captcha, userAns: e.target.value })} placeholder="Your answer" className="w-32 p-2 border-2 border-slate-200 rounded-lg text-center text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                )}
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><i className="fas fa-paperclip"></i></div>
                    <div><h3 className="font-bold text-slate-800">Supporting Documents</h3><p className="text-xs text-slate-500">Upload evidence or relevant files</p></div>
                </div>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all block">
                    <i className="fas fa-cloud-upload-alt text-3xl text-slate-400 mb-2 block"></i>
                    <p className="text-slate-600 font-medium text-sm">Drag & drop files here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">Supported: PDF, JPG, PNG, MP4 (Max 10MB each)</p>
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.mp4" className="hidden" onChange={handleFileChange} />
                </label>
                {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {uploadedFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2"><i className="fas fa-file text-blue-500"></i><span className="text-slate-700">{f.name}</span><span className="text-slate-400">({f.size})</span></div>
                                <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors"><i className="fas fa-times"></i></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-8">
                <button onClick={saveDraft} className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-save"></i> Save as Draft
                </button>
                <button onClick={handleReview} className="flex-1 py-3.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    Review & Submit <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default GrievanceForm;
