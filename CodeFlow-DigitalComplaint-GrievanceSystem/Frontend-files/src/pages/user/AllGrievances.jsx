// ============================================================
// AllGrievances.jsx — REAL BACKEND VERSION
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const UserAllGrievances = () => {
  const { user } = useAuth();
  const [grievanceCounts, setGrievanceCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      try {
        const all = await grievanceService.getUserGrievances(user);
        const counts = {};
        CATEGORIES.forEach(cat => counts[cat.value] = 0);
        all.forEach(g => {
          const catVal = CATEGORIES.find(c => c.value === g.category || c.label === g.category)?.value || g.category;
          if (catVal) counts[catVal] = (counts[catVal] || 0) + 1;
        });
        setGrievanceCounts(counts);
      } catch (err) {
        console.error('[AllGrievances] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div></div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">My Grievance Section</h1>
        <p className="text-[var(--text-secondary)] font-medium">Select a category to view your grievances and track progress</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-center gap-3 mb-8 md:justify-start">
          <div className="flex items-center justify-center w-12 h-12 text-blue-700 bg-white border shadow-sm rounded-2xl border-slate-100">
            <i className="text-xl fas fa-th-large"></i>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Grievance Categories</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={index}
              to={`/user/list?category=${encodeURIComponent(cat.value)}`}
              className="group bg-white p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(30,58,138,0.12)] transform hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute w-24 h-24 transition-colors duration-500 rounded-full -right-4 -top-4 bg-slate-50 group-hover:bg-blue-50"></div>
              <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center text-3xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6 shadow-inner relative z-10">
                <i className={`fas ${cat.icon}`}></i>
              </div>
              <div className="relative z-10">
                <div className="mb-2 text-5xl font-black transition-colors duration-500 transform text-slate-800 group-hover:text-blue-700 group-hover:scale-110">
                  {grievanceCounts[cat.value] || 0}
                </div>
                <div className="text-sm font-black text-slate-400 uppercase tracking-[2px] group-hover:text-slate-800 transition-colors">
                  {cat.label}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-blue-700 to-indigo-500 group-hover:scale-x-100"></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAllGrievances;
