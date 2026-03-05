import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const ReviewPage = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('grievanceDatabase') || '{}');
    const found = Object.values(db).flat().find(g => g.code === code);
    if (found) {
      setGrievance(found);
    }
    setLoading(false);
  }, [code]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div></div>;

  if (!grievance) return (
    <div className="p-20 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Case Record Not Found</h2>
      <button onClick={() => navigate(-1)} className="text-blue-700 font-bold hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-700 font-bold transition-colors">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 flex items-center gap-2">
            <i className="fas fa-print"></i> Print
          </button>
          <button className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-800 flex items-center gap-2">
            <i className="fas fa-download"></i> Download PDF
          </button>
        </div>
      </div>

      {/* Main Document Card */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
        {/* Document Header */}
        <div className="bg-slate-900 text-white p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <i className="fas fa-file-contract text-3xl"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Grievance Case Review</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-80">Official Record • Code Flow Digital Grievance Portal</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Case Overview */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Case Overview</h2>
              <div className="h-[2px] w-8 bg-blue-900 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Grievance Code', value: grievance.code, highlight: true },
                { label: 'Submission Date', value: new Date(grievance.submissionDate || grievance.date).toLocaleDateString() },
                { label: 'Status', value: grievance.status, status: true },
                { label: 'Category', value: grievance.category },
                { label: 'Priority', value: grievance.priority || 'Normal' },
                { label: 'Tracking ID', value: grievance.code, highlight: true }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  {item.status ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(item.value)}`}>
                      {item.value}
                    </span>
                  ) : (
                    <p className={`text-sm font-black ${item.highlight ? 'text-blue-700 font-mono tracking-wider' : 'text-slate-800'}`}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Student Information */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Student Information</h2>
              <div className="h-[2px] w-8 bg-blue-900 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Full Name', value: user?.name || 'Gaurav Singh' },
                { label: 'Roll Number', value: user?.rollNo || '2401201183' },
                { label: 'Course & Year', value: user?.course || 'B.C.A (AI & DS)' },
                { label: 'University Email', value: user?.uniEmail || user?.email || 'N/A' },
                { label: 'Personal Email', value: user?.personalEmail || user?.email || 'N/A' },
                { label: 'Phone Number', value: user?.phone || '9953304840' }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-black text-slate-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Grievance Details */}
          <section className="space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Grievance Details</h2>
              <div className="h-[2px] w-8 bg-blue-900 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Incident</p>
                <p className="text-sm font-black text-slate-800">{grievance.incidentDate || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time of Incident</p>
                <p className="text-sm font-black text-slate-800">{grievance.incidentTime || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                <p className="text-sm font-black text-slate-800">{grievance.department || grievance.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incident Description</p>
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{grievance.description}</p>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Desired Resolution</p>
                <p className="text-sm font-medium text-blue-900 leading-relaxed font-bold">{grievance.desiredResolution || 'Pending formal request for specific resolution.'}</p>
              </div>
            </div>
          </section>

          {/* Admin Response */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Administrative Response</h2>
              <div className="h-[2px] w-8 bg-blue-900 rounded-full"></div>
            </div>
            <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-[32px] text-center">
              <p className="text-sm font-bold text-slate-400 italic">
                {grievance.adminResponse || "No official administrative response has been recorded for this case yet. The administration will update this section once the review process is complete."}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-8 border-t border-slate-100 text-center space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This is a system-generated official record from the Code Flow Digital Portal.</p>
          <p className="text-xs font-black text-slate-800 tracking-tight italic uppercase tracking-wider">Generated: {new Date().toLocaleString('en-IN')} • Case: {grievance.code}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;