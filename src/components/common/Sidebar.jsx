import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
  isOpen,
  onToggle,
  user,
  navItems,
  onLogout,
  isAdmin = false,
}) => {
  const location = useLocation();

  const renderNavIcon = (item, idx) => {
    const isActive = item.active || location.pathname === item.path || location.pathname.startsWith(item.path);
    
    return (
      <Link
        key={idx}
        to={item.path}
        onClick={() => isOpen && onToggle()}
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all relative group ${
          isActive 
            ? 'bg-gradient-to-br from-blue-900 to-teal-600 text-white shadow-lg' 
            : 'text-gray-500 hover:bg-blue-50 hover:text-blue-900'
        }`}
        title={item.label}
      >
        <i className={`fas ${item.icon}`}></i>
        
        {/* Tooltip */}
        <span className="absolute z-50 invisible px-2 py-1 text-xs text-white transition-all bg-gray-800 rounded-lg opacity-0 left-14 group-hover:opacity-100 group-hover:visible whitespace-nowrap">
          {item.label}
        </span>
        
        {/* Active Indicator */}
        {isActive && (
          <span className="absolute left-0 w-1 h-6 -translate-y-1/2 bg-blue-900 rounded-r-full top-1/2"></span>
        )}
      </Link>
    );
  };

  const renderNavLink = (item, idx) => {
    const isActive = item.active || location.pathname === item.path || location.pathname.startsWith(item.path);
    
    return (
      <Link
        key={idx}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-50 text-blue-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <i className={`fas ${item.icon} w-5 text-center`}></i>
        <span>{item.label}</span>
      </Link>
    );
  };

  // Group nav items by section
  const mainItems = navItems.slice(0, isAdmin ? 4 : 5);
  const commItems = navItems.slice(isAdmin ? 4 : 5, isAdmin ? 7 : 8);
  const accountItems = navItems.slice(isAdmin ? 7 : 8);

  return (
    <>
      {/* Icon Sidebar (70px) */}
      <aside className={`fixed left-0 top-[70px] bottom-0 w-[70px] bg-white border-r border-gray-200 z-40 flex flex-col items-center py-4 gap-2 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mb-2 ${
            isOpen ? 'bg-blue-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-900'
          }`}
          title={isOpen ? 'Collapse Menu' : 'Expand Menu'}
        >
          <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>

        {/* Nav Icons */}
        {navItems.map(renderNavIcon)}
      </aside>

      {/* Expandable Panel (280px) */}
      <div className={`fixed left-[70px] top-[70px] bottom-0 w-[280px] bg-white border-r border-gray-200 z-30 overflow-y-auto transition-transform duration-300 shadow-xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* User Card */}
        <div className="p-4 m-4 text-white shadow-lg bg-gradient-to-br from-blue-900 to-teal-600 rounded-2xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-xl border-2 rounded-full bg-white/20 backdrop-blur-sm border-white/30">
            <i className={`fas ${isAdmin ? 'fa-user-shield' : 'fa-user-graduate'}`}></i>
          </div>
          <h3 className="font-bold text-center truncate">{user?.name || (isAdmin ? 'Administrator' : 'Student User')}</h3>
          <p className="mt-1 text-xs text-center text-white/80">{isAdmin ? 'Super Admin' : 'Student'}</p>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 pb-4">
          {/* Main Menu */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</h4>
            <nav className="space-y-1">
              {mainItems.map(renderNavLink)}
            </nav>
          </div>

          {/* Communication */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Communication</h4>
            <nav className="space-y-1">
              {commItems.map(renderNavLink)}
            </nav>
          </div>

          {/* Account */}
          <div className="mb-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              {isAdmin ? 'Settings' : 'Account'}
            </h4>
            <nav className="space-y-1">
              {accountItems.map(renderNavLink)}
            </nav>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-semibold text-red-600 transition-all bg-red-50 rounded-xl hover:bg-red-100"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;