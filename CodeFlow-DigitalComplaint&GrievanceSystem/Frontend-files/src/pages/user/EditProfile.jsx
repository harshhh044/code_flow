import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserEditProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [form, setForm] = useState({
    name: '', email: '', personalEmail: '', phone: '', studentId: '',
    courseYear: '', department: '', address: '', bio: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        personalEmail: user.personalEmail || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        courseYear: user.courseYear || '',
        department: user.department || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) { alert('New passwords do not match!'); return; }
    if (passwordForm.newPass.length < 6) { alert('Password must be at least 6 characters!'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.email === user?.email);
    if (idx !== -1) { users[idx].password = passwordForm.newPass; localStorage.setItem('users', JSON.stringify(users)); }
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    alert('Password changed successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Edit Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information and account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg flex-shrink-0">
          <i className="fas fa-user-graduate"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Student'}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="mt-2 inline-block text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Student</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-5">
        {[['profile', 'fa-user', 'Profile'], ['security', 'fa-lock', 'Security'], ['notifications', 'fa-bell', 'Notifications']].map(([t, icon, label]) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === t ? 'bg-blue-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
            <i className={`fas ${icon}`}></i>{label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name', 'Full Name', 'text', 'John Doe'], ['studentId', 'Student ID / Roll No', 'text', 'CS2023001'], ['email', 'University Email', 'email', 'student@uni.edu'], ['personalEmail', 'Personal Email', 'email', 'personal@gmail.com'], ['courseYear', 'Course & Year', 'text', 'B.Tech - 3rd Year'], ['department', 'Department', 'text', 'Computer Science'], ['phone', 'Phone Number', 'tel', '+91 9876543210']].map(([id, label, type, placeholder]) => (
              <div key={id}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                <input type={type} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })} placeholder={placeholder} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us a bit about yourself..." className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
          {saved && <div className="flex items-center gap-2 py-3 px-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium"><i className="fas fa-check-circle"></i> Profile updated successfully!</div>}
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <i className="fas fa-save"></i> Save Changes
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 mb-4">Change Password</h3>
          {[['current', 'Current Password'], ['newPass', 'New Password'], ['confirm', 'Confirm New Password']].map(([id, label]) => (
            <div key={id}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
              <input type="password" value={passwordForm[id]} onChange={e => setPasswordForm({ ...passwordForm, [id]: e.target.value })} required className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <i className="fas fa-info-circle mr-1"></i> Password must be at least 6 characters long.
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <i className="fas fa-lock"></i> Update Password
          </button>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {[['Email Notifications', 'Get email updates on your grievance status', 'email'], ['Status Updates', 'Notify when your grievance status changes', 'status'], ['New Messages', 'Notify when admin sends a message', 'messages'], ['Notice Board', 'Get alerts for new notices and announcements', 'notices']].map(([title, desc, key]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-checked:bg-blue-700 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full py-3 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all" onClick={() => alert('Preferences saved!')}>
            <i className="fas fa-save mr-2"></i>Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default UserEditProfile;