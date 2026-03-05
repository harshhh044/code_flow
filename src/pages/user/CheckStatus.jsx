import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS } from '../../utils/constants';

const getStatusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'resolved') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'pending' || s === 'processing') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s === 'in progress') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const UserCheckStatus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingNotFound, setTrackingNotFound] = useState(false);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
    const anonDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');

    // Combine and filter for current user
    const allUserGrievances = [
      ...Object.values(db).flat(),
      ...anonDb
    ].filter(g =>
      g && (
        (user?.email && (g.email === user.email || g.personalEmail === user.email || g.uniEmail === user.email)) ||
        (user?.personalEmail && (g.email === user.personalEmail || g.personalEmail === user.personalEmail || g.uniEmail === user.personalEmail)) ||
        (user?.uniEmail && (g.email === user.uniEmail || g.personalEmail === user.uniEmail || g.uniEmail === user.uniEmail)) ||
        ((user?.rollNo || user?.studentId) && (g.rollNo === user?.rollNo || g.student_id === user?.studentId || g.student_id === user?.rollNo || g.rollNo === user?.studentId))
      )
    ).sort((a, b) => new Date(b.submissionDate || b.date) - new Date(a.submissionDate || a.date));

    setGrievances(allUserGrievances);
    setFiltered(allUserGrievances);
  }, [user]);

  useEffect(() => {
    let result = [...grievances];
    if (statusFilter !== 'All') result = result.filter(g => g.status === statusFilter);
    if (listSearch) {
      result = result.filter(g =>
        g.subject?.toLowerCase().includes(listSearch.toLowerCase()) ||
        g.code?.toLowerCase().includes(listSearch.toLowerCase()) ||
        g.category?.toLowerCase().includes(listSearch.toLowerCase())
      );
    }
    setFiltered(result);
  }, [listSearch, statusFilter, grievances]);

  const handleTrackByCode = () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setTrackingNotFound(false);
    setTrackingResult(null);

    setTimeout(() => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        const anonDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');
        const all = [...Object.values(db).flat(), ...anonDb];
        const found = all.find(g => g && g.code?.toUpperCase() === searchCode.trim().toUpperCase());

        if (found) {
          setTrackingResult(found);
        } else {
          setTrackingNotFound(true);
        }
        setLoading(false);
      }, 800);
    }, 800);
  };

  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === 'Pending').length,
    inProgress: grievances.filter(g => g.status === 'In Progress').length,
    resolved: grievances.filter(g => g.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
      <div className="mb-10 text-center md:text-left transition-all duration-300">
        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">Check Status</h1>
        <p className="text-[var(--text-secondary)] font-medium italic">Monitor your grievances and check status updates in real-time.</p>
      </div>



      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Grievances', value: stats.total, icon: 'fa-clipboard-list', color: 'blue' },
          { label: 'Pending', value: stats.pending, icon: 'fa-clock', color: 'amber' },
          { label: 'In Progress', value: stats.inProgress, icon: 'fa-spinner', color: 'indigo' },
          { label: 'Resolved', value: stats.resolved, icon: 'fa-check-circle', color: 'emerald' }
        ].map((stat) => (
          <div key={stat.label} className="p-8 transition-all bg-white border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] hover:shadow-[0_20px_50px_rgba(30,58,138,0.12)] hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-${stat.color}-50 text-${stat.color}-600 shadow-inner`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
            <p className="mt-1 text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side - Search & Filters */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px]">
            <h3 className="flex items-center gap-3 mb-6 text-xl font-black text-slate-800 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <i className="fas fa-search-location"></i>
              </div>
              Quick Track
            </h3>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500">
              Enter your specific grievance code to see detailed progress and admin comments.
            </p>
            <div className="space-y-4">
              <input
                value={searchCode}
                onChange={e => { setSearchCode(e.target.value.toUpperCase()); setTrackingResult(null); setTrackingNotFound(false); }}
                onKeyDown={e => e.key === 'Enter' && handleTrackByCode()}
                placeholder="GRV-2026-XXXX"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[20px] text-slate-700 font-mono font-bold transition-all uppercase tracking-widest placeholder:tracking-normal outline-none"
              />
              <button
                onClick={handleTrackByCode}
                disabled={loading || !searchCode.trim()}
                className="flex items-center justify-center w-full gap-3 py-4 font-black text-sm text-white transition-all bg-gradient-to-r from-blue-900 to-indigo-800 rounded-[20px] hover:shadow-xl hover:shadow-blue-900/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-crosshairs"></i>}
                Track Status
              </button>
            </div>

            {trackingResult && (
              <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                <p className="mb-3 text-[10px] font-black tracking-[2px] text-blue-600 uppercase">Tracked Result</p>
                <h4 className="mb-4 font-black text-slate-800 text-lg uppercase tracking-tight leading-tight">{trackingResult.subject}</h4>
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(trackingResult.status)}`}>{trackingResult.status}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{new Date(trackingResult.submissionDate).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => navigate(`/user/grievance/${trackingResult.code}`)}
                  className="flex items-center justify-center w-full gap-2 py-3 bg-white border border-blue-100 text-blue-700 font-black text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  View Full History <i className="fas fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            )}

            {trackingNotFound && (
              <div className="p-6 mt-8 text-center border border-red-100 bg-red-50/50 rounded-[32px]">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p className="text-sm font-black text-red-700 uppercase tracking-widest">Not Found</p>
                <p className="text-xs text-red-500 mt-2 font-medium italic">Please double check your code.</p>
              </div>
            )}
          </div>

          <div className="p-8 border bg-amber-50/50 rounded-[40px] border-amber-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 rounded-full -mr-10 -mt-10"></div>
            <div className="flex gap-5 relative z-10">
              <div className="flex items-center justify-center w-12 h-12 bg-white text-amber-500 rounded-2xl shrink-0 shadow-sm border border-amber-50">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div>
                <h4 className="mb-1 text-base font-black text-amber-900 tracking-tight">Lost your code?</h4>
                <p className="text-xs leading-relaxed text-amber-700 font-medium italic">
                  Identified grievances are automatically listed in the table. Anonymous tracking codes cannot be recovered if lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - List & Table */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px]">
            <div className="flex flex-col items-center justify-between gap-4 p-8 border-b border-slate-50 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <i className="fas fa-list-ul"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Records List</h3>
              </div>
              <div className="relative w-full sm:w-72">
                <i className="absolute text-xs -translate-y-1/2 fas fa-search left-4 top-1/2 text-slate-400"></i>
                <input
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  placeholder="Search in list..."
                  className="w-full py-3 pr-4 text-xs font-bold border-2 border-slate-50 pl-11 bg-slate-50 rounded-[18px] focus:outline-none focus:border-blue-500 focus:bg-white transition-all tracking-wide"
                />
              </div>
            </div>

            <div className="flex gap-2 p-6 overflow-x-auto border-b bg-slate-50/30 border-slate-50 no-scrollbar">
              {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-6 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === s ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    {['Code', 'Subject', 'Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                          <i className="text-4xl fas fa-inbox"></i>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No match found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((g, i) => (
                      <tr key={i} className="transition-all hover:bg-blue-50/30 group cursor-pointer" onClick={() => navigate(`/user/grievance/${g.code}`)}>
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-700 tracking-wider group-hover:scale-105 transition-transform origin-left">{g.code}</td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-1 group-hover:text-blue-700 transition-colors">{g.subject}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{g.category}</p>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-medium">
                          {new Date(g.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[1.5px] border shadow-sm ${getStatusColor(g.status)}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <Link
                            to={`/user/grievance/${g.code}`}
                            className="flex items-center justify-center w-10 h-10 transition-all rounded-[14px] shadow-sm bg-slate-50 text-slate-300 group-hover:bg-blue-900 group-hover:text-white border border-slate-100 group-hover:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="text-xs fas fa-chevron-right"></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-6 border-t bg-slate-50/50 border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">SHOWING {filtered.length} GRIEVANCES</p>
              <div className="flex gap-2">
                <button className="flex items-center justify-center w-10 h-10 text-xs bg-white border border-slate-100 rounded-xl text-slate-300 transition-all hover:bg-slate-50 disabled:opacity-30" disabled><i className="fas fa-chevron-left"></i></button>
                <button className="flex items-center justify-center w-10 h-10 text-xs bg-white border border-slate-100 rounded-xl text-slate-300 transition-all hover:bg-slate-50 disabled:opacity-30" disabled><i className="fas fa-chevron-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
    </div>
  );
};

export default UserCheckStatus;
