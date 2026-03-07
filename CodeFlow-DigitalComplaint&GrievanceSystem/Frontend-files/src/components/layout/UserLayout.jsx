import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, checkGrievanceUpdates } = useNotifications();
  const { theme, toggleTheme, isDark } = useTheme();

  // UI State
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsPanelOpen(false);
      } else {
        const saved = localStorage.getItem('sidebarCollapsed');
        setIsPanelOpen(saved !== 'true');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowNotifications(false);
        if (isMobile) setIsMobileMenuOpen(false);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if ((e.key === 'm' || e.key === 'M') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) togglePanel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const navItems = [
    { icon: 'fa-th-large', label: 'Dashboard', path: '/user', active: location.pathname === '/user' },
    { icon: 'fa-plus-circle', label: 'Submit Grievance', path: '/user/submit', active: location.pathname === '/user/submit' },
    { icon: 'fa-clipboard-list', label: 'My Grievances', path: '/user/grievances', active: location.pathname.startsWith('/user/grievance') || location.pathname === '/user/grievances' || location.pathname === '/user/list' },
    { icon: 'fa-chart-pie', label: 'Insights', path: '/user/insights', active: location.pathname === '/user/insights' },
    { icon: 'fa-tasks', label: 'Check Status', path: '/user/status', active: location.pathname === '/user/status' },
    { icon: 'fa-envelope', label: 'Mail', path: '/user/mail', active: location.pathname === '/user/mail' },
    { icon: 'fa-book', label: 'Guidelines', path: '/user/guidelines', active: location.pathname === '/user/guidelines' },
    { icon: 'fa-bullhorn', label: 'Notice Board', path: '/user/notices', active: location.pathname === '/user/notices' },
    { icon: 'fa-user-cog', label: 'Edit Profile', path: '/user/profile', active: location.pathname === '/user/profile' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      let userGrievances = [];
      let notices = [];
      let guidelines = [];
      try {
        userGrievances = await grievanceService.getUserGrievances(user);
        notices = JSON.parse(localStorage.getItem('notices') || '[]');
        guidelines = JSON.parse(localStorage.getItem('guidelines_db') || '[]');
      } catch (e) {
        console.error("Search index error:", e);
      }

      const results = [
        ...navItems.map(item => ({ type: 'feature', title: item.label, url: item.path })),
        ...userGrievances.map(g => ({ type: 'grievance', title: g.subject, url: `/user/grievance/${g.code}` })),
        ...notices.map(n => ({ type: 'notice', title: n.title, url: '/user/notices' })),
        ...guidelines.map(g => ({ type: 'guideline', title: g.title, url: '/user/guidelines' }))
      ].filter(item => item.title?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);
      setSearchResults(results);
    };

    fetchData();
  }, [searchQuery, user]);

  useEffect(() => { if (user?.email) checkGrievanceUpdates(); }, [user, checkGrievanceUpdates]);

  const togglePanel = () => {
    const newState = !isPanelOpen;
    setIsPanelOpen(newState);
    if (!isMobile) localStorage.setItem('sidebarCollapsed', !newState);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleSearchSelect = (url) => { navigate(url); setShowSearchResults(false); setSearchQuery(''); };

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState('new');
  const [supportForm, setSupportForm] = useState({ issueType: '', priority: '', subject: '', description: '' });

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const queries = JSON.parse(localStorage.getItem('supportQueries') || '[]');
    queries.push({ id: Date.now(), ...supportForm, status: 'Open', date: new Date().toISOString(), userEmail: user?.email, userName: user?.name });
    localStorage.setItem('supportQueries', JSON.stringify(queries));
    setSupportForm({ issueType: '', priority: '', subject: '', description: '' });
    setShowSupportModal(false);
    alert('Support query submitted successfully!');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc]'}`}>
      <nav className={`fixed top-0 left-0 right-0 h-[70px] backdrop-blur-md border-b z-50 px-4 lg:px-8 flex items-center justify-between shadow-sm transition-all duration-300 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`w-9 h-9 rounded-lg lg:hidden flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700 hover:bg-blue-900 hover:text-white'}`}>
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <Link to="/user" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-900 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-code-branch"></i>
            </div>
            <span className={`hidden sm:block text-xl font-black bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent transition-all ${isDark ? 'from-blue-400 to-teal-300' : ''}`}>CODE FLOW</span>
          </Link>
        </div>

        <div className="hidden md:block flex-1 max-w-xl mx-4" ref={searchRef}>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input id="global-search" type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }} onFocus={() => setShowSearchResults(true)} placeholder="Search everything..." className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm transition-all outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`} />
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-[100] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => handleSearchSelect(r.url)} className={`w-full px-4 py-3 text-left transition-colors border-b last:border-0 text-sm font-semibold ${isDark ? 'hover:bg-slate-800 border-slate-800 text-slate-300' : 'hover:bg-blue-50 border-slate-50 text-slate-700'}`}>{r.title}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-900 hover:text-white'}`}>
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-900 hover:text-white'}`}>
              <i className="fas fa-bell"></i> {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
              <span className="hidden sm:inline">Alerts</span>
            </button>
            {showNotifications && (
              <div className={`absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-[100] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`px-4 py-3 font-black text-sm uppercase tracking-widest border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>Notifications</div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? <div className="p-8 text-center text-slate-400 italic text-sm">No new alerts</div> : notifications.map(n => (
                    <div key={n.id} onClick={() => { if (n.url) navigate(n.url); setShowNotifications(false); }} className={`p-4 border-b last:border-0 cursor-pointer transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-50 hover:bg-blue-50'}`}>
                      <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowSupportModal(true)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">Support</button>
        </div>
      </nav>

      <aside className={`fixed left-0 top-[70px] bottom-0 w-[70px] border-r z-40 flex flex-col items-center py-6 gap-3 transition-all duration-300 ${isDark ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50' : 'bg-white border-slate-100 shadow-sm'} ${isMobileMenuOpen || (isMobile && isPanelOpen) ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <button onClick={togglePanel} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all mb-4 ${isPanelOpen ? 'bg-blue-900 text-white' : (isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-blue-900')}`}>
          <i className={`fas ${isPanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
        {navItems.map((item, i) => (
          <Link key={i} to={item.path} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all relative group ${item.active ? 'bg-gradient-to-br from-blue-900 to-teal-600 text-white shadow-xl scale-110' : (isDark ? 'text-slate-500 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:text-blue-900 hover:bg-blue-50')}`} title={item.label}>
            <i className={`fas ${item.icon}`}></i>
            {item.active && <span className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r-full"></span>}
          </Link>
        ))}
      </aside>

      <div className={`fixed left-[70px] top-[70px] bottom-0 w-[280px] border-r z-30 overflow-y-auto transition-all duration-300 ${isDark ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/30' : 'bg-white border-slate-100 shadow-lg'} ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 m-4 text-white shadow-xl bg-gradient-to-br from-blue-900 to-teal-600 rounded-[32px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl mx-auto mb-4 border border-white/30"><i className="fas fa-user-graduate"></i></div>
          <h3 className="font-black text-center uppercase tracking-tight truncate" title={user?.name}>{user?.name || 'Student User'}</h3>
          <p className="text-[10px] text-center text-white/70 font-black uppercase tracking-[2px] mt-1">Grievant ID: {user?.uid || user?.studentId || 'N/A'}</p>
        </div>

        <nav className="px-5 py-4 space-y-6">
          {[
            { title: 'Main Menu', items: navItems.slice(0, 5) },
            { title: 'Communication', items: navItems.slice(5, 8) },
            { title: 'Account', items: navItems.slice(8) }
          ].map((sec, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] px-3 mb-3">{sec.title}</h4>
              <div className="space-y-1">
                {sec.items.map((item, j) => (
                  <Link key={j} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${item.active ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-900 shadow-inner') : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}`}>
                    <i className={`fas ${item.icon} w-5 text-center text-sm`}></i> <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-5 mt-auto border-t transition-colors border-slate-100 dark:border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[2px] text-red-600 bg-red-50 dark:bg-red-900/10 rounded-[20px] hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transition-all outline-none">
            <i className="fas fa-sign-out-alt"></i> <span>Sign Out</span>
          </button>

          <button onClick={toggleTheme} className={`w-full mt-4 flex items-center justify-between px-5 py-4 rounded-[24px] border-2 transition-all duration-300 active:scale-95 shadow-sm ${isDark ? 'bg-slate-800 border-blue-500/30 text-blue-400 shadow-blue-500/10' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
              <i className={`fas ${isDark ? 'fa-moon text-lg' : 'fa-sun text-lg text-amber-500'}`}></i>
              <span>{isDark ? 'Night View' : 'Day View'}</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-all duration-500 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-500 shadow-sm ${isDark ? 'right-1' : 'left-1'}`}></div>
            </div>
          </button>
        </div>
      </div>

      <main className={`min-h-screen transition-all duration-300 pt-[70px] ${isPanelOpen && !isMobile ? 'ml-[350px]' : 'ml-[70px]'} ${isDark ? 'bg-slate-950' : ''}`}>
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
          <Outlet key={location.pathname} />
        </div>
      </main>

      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowSupportModal(false)}>
          <div className={`w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-900 to-teal-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30 shadow-inner"><i className="fas fa-headset text-white"></i></div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Need Help?</h3>
              <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest">Technical Assistance Center</p>
            </div>
            <div className="p-8 space-y-6">
              <div className={`p-1 flex rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {['new', 'history'].map(t => (
                  <button key={t} onClick={() => setSupportTab(t)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${supportTab === t ? (isDark ? 'bg-slate-700 text-white shadow-xl' : 'bg-white text-blue-900 shadow-md') : 'text-slate-400 hover:text-slate-600'}`}>{t === 'new' ? 'New Ticket' : 'My Tickets'}</button>
                ))}
              </div>
              {supportTab === 'new' ? (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select required className={`w-full p-4 rounded-2xl border-2 outline-none text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}>
                      <option value="">Issue Type</option>
                      <option>Technical Bug</option>
                      <option>Account Issue</option>
                    </select>
                    <select required className={`w-full p-4 rounded-2xl border-2 outline-none text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`}>
                      <option value="">Priority</option>
                      <option>Low</option>
                      <option>High</option>
                    </select>
                  </div>
                  <input required placeholder="Subject Title" className={`w-full p-4 rounded-2xl border-2 outline-none text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`} />
                  <textarea rows={4} required placeholder="Detailed message..." className={`w-full p-4 rounded-2xl border-2 outline-none text-xs font-black uppercase tracking-widest transition-all resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500'}`} />
                  <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-black uppercase tracking-[3px] rounded-2xl hover:shadow-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20">Submit Ticket</button>
                </form>
              ) : <div className="text-center py-12 italic text-slate-400 text-sm">No activity records found</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;