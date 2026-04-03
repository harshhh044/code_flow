import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import grievanceService from '../../services/grievanceService';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Load from backend using code param
  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const data = await grievanceService.getGrievanceByCode(code);
        setGrievance(data);
      } catch (err) {
        // If not found by code, try by ID
        try {
          const data = await grievanceService.getGrievanceById(code);
          setGrievance(data);
        } catch {
          setGrievance(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGrievance();
  }, [code]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
    </div>
  );

  if (!grievance) return (
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

  // Build timeline from history or default
  const timeline = grievance.history?.length > 0
    ? grievance.history.map((h, i) => ({
        title: h.status,
        date: new Date(h.timestamp || h.date).toLocaleString(),
        desc: h.note || h.comment || `Status updated to ${h.status}`,
        completed: i < grievance.history.length - 1,
        active: i === grievance.history.length - 1
      }))
    : [
        { title: 'Grievance Submitted', date: new Date(grievance.createdAt || grievance.submissionDate).toLocaleString(), desc: 'Your grievance has been successfully logged.', completed: true },
        { title: 'Initial Review', date: 'Processing', desc: 'Warden/Admin is reviewing the complaint.', active: grievance.status === 'Pending' },
        { title: 'Processing', date: 'Pending', desc: 'Action being taken on the grievance.', completed: grievance.status === 'In Progress' || grievance.status === 'Resolved' },
        { title: 'Final Resolution', date: 'Pending', desc: 'Closure of the grievance.', completed: grievance.status === 'Resolved' }
      ];

  return (
    <div className="min-h-screen bg-transparent pb-10">
      <Link
        to={`/user/list?category=${encodeURIComponent(grievance.category)}`}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 font-bold mb-6 transition-colors group"
      >
        <i className="fas fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
        Back to {grievance.category}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm text-blue-700 flex items-center justify-center text-xl border border-blue-50">
          <i className="fas fa-file-alt"></i>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Grievance Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Details */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-black text-slate-800">User Details</h2>
              <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Name', user?.name || user?.fullName],
                ['Roll No', user?.rollNo || user?.studentId || user?.uid],
                ['Course', user?.course || user?.department],
                ['Phone', user?.phone],
                ['Email', user?.email],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-3">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider w-20">{label}:</span>
                  <span className="text-slate-700 font-black text-sm truncate">{val}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Grievance Summary */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-black text-slate-800">Grievance Details</h2>
              <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800 leading-tight">{grievance.subject || grievance.title}</h3>
                <p className="text-blue-700 font-mono font-black tracking-widest text-xs uppercase">Code: {grievance.code}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(grievance.status)}`}>
                {grievance.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 py-6 border-y border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                <p className="text-sm font-black text-slate-700">{new Date(grievance.createdAt || grievance.submissionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <p className="text-sm font-black text-slate-700">{grievance.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                <p className="text-sm font-black text-slate-700">{grievance.priority || 'Normal'}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-slate-600 leading-relaxed text-sm font-medium">{grievance.description}</p>
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

        {/* Right Column - Timeline */}
        <div className="space-y-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-black text-slate-800">Progress Tracker</h2>
              <div className="h-[2px] w-8 bg-blue-700 rounded-full"></div>
            </div>

            <div className="space-y-8 relative">
              <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-slate-100"></div>
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${item.completed ? 'bg-green-500' : item.active ? 'bg-blue-600 animate-pulse ring-4 ring-blue-100' : 'bg-slate-200'}`}>
                    {item.completed && <i className="fas fa-check text-white text-[10px]"></i>}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-black uppercase tracking-wider ${item.completed ? 'text-green-600' : item.active ? 'text-blue-700' : 'text-slate-400'}`}>{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 italic mb-1">{item.date}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Response */}
            {grievance.adminResponse && (
              <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Admin Response</p>
                <p className="text-sm text-slate-700">{grievance.adminResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-50 border border-slate-200">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-slate-50 flex justify-between items-center z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-800 leading-none mb-2">Detailed Inquiry</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Record: {grievance.code}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-xl">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="px-10 py-10 space-y-10">
              <section>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Full Description</h4>
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <p className="text-slate-600 text-sm font-medium leading-[1.8]">{grievance.description}</p>
                </div>
              </section>

              <section className="bg-blue-900 rounded-[32px] p-8 shadow-2xl text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-[4px] mb-2">Final Documentation</p>
                    <h4 className="text-xl font-black mb-1">Grievance Case Review</h4>
                    <p className="text-blue-100/60 text-xs font-medium">Download the complete formal record of this case.</p>
                  </div>
                  <button
                    onClick={() => navigate(`/user/review/${grievance.code || grievance._id}`)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
                  >
                    <i className="fas fa-download"></i> EXPORT REVIEW
                  </button>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Administration Response</h4>
                <div className="p-6 bg-slate-50 rounded-[24px] border-l-[6px] border-blue-900">
                  <p className="text-slate-500 text-sm font-bold italic">
                    "{grievance.adminResponse || 'Awaiting verification from the concerned department.'}"
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrievanceDetail;
