import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTab, setSupportTab] = useState('new');
  const [supportForm, setSupportForm] = useState({ issueType: '', priority: '', subject: '', description: '' });

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const navItems = [
    { icon: 'fa-th-large', label: 'Dashboard', path: '/admin', active: location.pathname === '/admin' },
    { icon: 'fa-clipboard-list', label: 'All Grievances', path: '/admin/grievances', active: location.pathname.startsWith('/admin/grievances') || location.pathname === '/admin/grievances' },
    { icon: 'fa-chart-pie', label: 'Insights', path: '/admin/insights', active: location.pathname === '/admin/insights' },
    { icon: 'fa-tasks', label: 'Check Status', path: '/admin/status', active: location.pathname === '/admin/status' },
    { icon: 'fa-envelope', label: 'Mail', path: '/admin/mail', active: location.pathname === '/admin/mail' },
    { icon: 'fa-book', label: 'Guidelines', path: '/admin/guidelines', active: location.pathname === '/admin/guidelines' },
    { icon: 'fa-bullhorn', label: 'Notice Board', path: '/admin/notices', active: location.pathname === '/admin/notices' },
    { icon: 'fa-user-cog', label: 'Edit Profile', path: '/admin/profile', active: location.pathname === '/admin/profile' },
    { icon: 'fa-history', label: 'Account Activity', path: '/admin/activity', active: location.pathname === '/admin/activity' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsPanelOpen(false);
      } else {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        setIsPanelOpen(saved !== 'true');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
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
        document.getElementById('admin-global-search')?.focus();
      }
      if ((e.key === 'm' || e.key === 'M') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        togglePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  // Admin search - includes all grievances
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const database = JSON.parse(localStorage.getItem('grievanceDatabase') || '{}');
    const anonDB = JSON.parse(localStorage.getItem('anonymousGrievanceDatabase') || '[]');
    const allGrievances = [...Object.values(database).flat(), ...anonDB];

    const results = [
      ...navItems.map(item => ({ type: 'feature', title: item.label, url: item.path })),
      ...allGrievances.map(g => ({
        type: 'grievance',
        title: g.subject || 'Untitled',
        description: g.description?.substring(0, 80) + '...',
        status: g.status,
        code: g.code,
        isAnonymous: g.isAnonymous,
        url: `/admin/grievances/${g.code}`
      }))
    ].filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

    setSearchResults(results);
  }, [searchQuery]);

  const togglePanel = () => {
    const newState = !isPanelOpen;
    setIsPanelOpen(newState);
    if (!isMobile) {
      localStorage.setItem('adminSidebarCollapsed', !newState);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSelect = (url) => {
    navigate(url);
    setShowSearchResults(false);
    setSearchQuery('');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Overlay */}
      {(isMobileMenuOpen || (isMobile && isPanelOpen)) && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (isMobile) setIsPanelOpen(false);
          }}
        />
      )}

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 px-4 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-center text-gray-700 transition-all bg-gray-100 rounded-lg lg:hidden w-9 h-9 hover:bg-blue-900 hover:text-white"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center text-white rounded-lg shadow-lg w-9 h-9 bg-gradient-to-br from-blue-900 to-teal-600">
              <i className="fas fa-code-branch"></i>
            </div>
            <span className="hidden text-xl font-extrabold text-transparent bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text sm:block">
              CODE FLOW
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 hidden max-w-xl mx-4 md:block" ref={searchRef}>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              id="admin-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search all grievances..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl top-full rounded-xl">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSelect(result.url)}
                    className="w-full px-4 py-3 text-left transition-colors border-b hover:bg-blue-50 border-gray-50 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{result.title}</span>
                      <div className="flex items-center gap-2">
                        {result.isAnonymous && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Anonymous
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${result.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          result.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{result.description}</p>
                    <p className="mt-1 text-xs text-gray-400">Code: {result.code}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="items-center hidden gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all bg-gray-100 sm:flex rounded-xl hover:bg-blue-900 hover:text-white"
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-blue-900 hover:text-white"
            >
              <i className="fas fa-bell"></i>
              <span className="hidden sm:inline">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-slate-100 shadow-2xl top-full w-80 sm:w-96 rounded-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">System Alerts</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-black uppercase tracking-tight text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-96">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">
                      No new alerts
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => { if (notif.url) navigate(notif.url); setShowNotifications(false); }}
                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-blue-50 transition-colors ${!notif.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                          }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-lg">
                            <i className="fas fa-info-circle"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight text-slate-800">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <i className="fas fa-headset"></i>
            <span className="hidden sm:inline">Support</span>
          </button>
        </div>
      </nav>

      {/* Icon Sidebar */}
      <aside className={`fixed left-0 top-[70px] bottom-0 w-[70px] bg-white border-r border-gray-200 z-40 flex flex-col items-center py-4 gap-2 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <button
          onClick={togglePanel}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mb-2 ${isPanelOpen ? 'bg-blue-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-900'
            }`}
        >
          <i className={`fas ${isPanelOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>

        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all relative group ${item.active
              ? 'bg-gradient-to-br from-blue-900 to-teal-600 text-white shadow-lg'
              : 'text-gray-500 hover:bg-blue-50 hover:text-blue-900'
              }`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span className="absolute z-50 invisible px-2 py-1 text-xs text-white transition-all bg-gray-800 rounded-lg opacity-0 left-14 group-hover:opacity-100 group-hover:visible whitespace-nowrap">
              {item.label}
            </span>
            {item.active && (
              <span className="absolute left-0 w-1 h-6 -translate-y-1/2 bg-blue-900 rounded-r-full top-1/2"></span>
            )}
          </Link>
        ))}
      </aside>

      {/* Expandable Panel */}
      <div className={`fixed left-[70px] top-[70px] bottom-0 w-[280px] bg-white border-r border-gray-200 z-30 overflow-y-auto transition-transform duration-300 shadow-xl ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Admin User Card */}
        <div className="p-4 m-4 text-white shadow-lg bg-gradient-to-br from-blue-900 to-teal-600 rounded-2xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-xl border-2 rounded-full bg-white/20 backdrop-blur-sm border-white/30">
            <i className="fas fa-user-shield"></i>
          </div>
          <h3 className="font-bold text-center truncate">{user?.name || 'Administrator'}</h3>
          <p className="mt-1 text-xs text-center text-white/80">Super Admin</p>
        </div>

        <div className="px-3 pb-4">
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</h4>
            <nav className="space-y-1">
              {navItems.slice(0, 4).map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Communication</h4>
            <nav className="space-y-1">
              {navItems.slice(4, 7).map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Settings</h4>
            <nav className="space-y-1">
              {navItems.slice(7).map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-semibold text-red-600 transition-all bg-red-50 rounded-xl hover:bg-red-100"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 pt-[70px] ${isPanelOpen && !isMobile ? 'ml-[350px]' : 'ml-[70px]'
        }`}>
        <div className="p-4 lg:p-8">
          <Outlet key={location.pathname} />
        </div>
      </main>

      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowSupportModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-900 to-teal-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30 shadow-inner"><i className="fas fa-headset text-white"></i></div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Need Help?</h3>
              <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest">Admin Technical Assistance</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-1 flex rounded-2xl bg-slate-100">
                {['new', 'history'].map(t => (
                  <button key={t} onClick={() => setSupportTab(t)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${supportTab === t ? 'bg-white text-blue-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{t === 'new' ? 'New Ticket' : 'My Tickets'}</button>
                ))}
              </div>
              {supportTab === 'new' ? (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select required value={supportForm.issueType} onChange={e => setSupportForm({ ...supportForm, issueType: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest focus:bg-white focus:border-blue-500 transition-all">
                      <option value="">Issue Type</option>
                      <option>Technical Bug</option>
                      <option>Account Issue</option>
                      <option>Data Sync</option>
                    </select>
                    <select required value={supportForm.priority} onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest focus:bg-white focus:border-blue-500 transition-all">
                      <option value="">Priority</option>
                      <option>Low</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <input required placeholder="Subject Title" value={supportForm.subject} onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest focus:bg-white focus:border-blue-500 transition-all" />
                  <textarea rows={4} required placeholder="Detailed message..." value={supportForm.description} onChange={e => setSupportForm({ ...supportForm, description: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest focus:bg-white focus:border-blue-500 transition-all resize-none" />
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

export default AdminLayout;