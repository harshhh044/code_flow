import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS } from '../../utils/constants';

const AdminEditProfile = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', adminId: '', department: '', role: 'Admin', bio: '' });

    useEffect(() => {
        if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', adminId: user.adminId || '', department: user.department || 'Administration', role: 'Admin', bio: user.bio || '' });
    }, [user]);

    const handleSave = (e) => {
        e.preventDefault();
        updateUser(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordForm.newPass !== passwordForm.confirm) { alert('Passwords do not match!'); return; }
        if (passwordForm.newPass.length < 6) { alert('Min 6 characters required!'); return; }
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.email === user?.email);
        if (idx !== -1) { users[idx].password = passwordForm.newPass; localStorage.setItem('users', JSON.stringify(users)); }
        setPasswordForm({ current: '', newPass: '', confirm: '' });
        alert('Password updated!');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-800">Admin Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your admin account settings</p>
            </div>

            {/* Admin Card */}
            <div className="bg-gradient-to-r from-blue-900 to-teal-600 rounded-2xl p-6 text-white mb-5 flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl flex-shrink-0">
                    <i className="fas fa-user-shield"></i>
                </div>
                <div>
                    <h2 className="text-xl font-bold">{user?.name || 'Administrator'}</h2>
                    <p className="text-white/80 text-sm">{user?.email}</p>
                    <span className="mt-2 inline-block text-xs font-bold px-3 py-1 bg-white/20 rounded-full">System Administrator</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-5">
                {[['profile', 'fa-user', 'Profile'], ['security', 'fa-lock', 'Security'], ['system', 'fa-cog', 'System']].map(([t, icon, label]) => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === t ? 'bg-blue-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                        <i className={`fas ${icon}`}></i>{label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && (
                <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[['name', 'Full Name', 'text'], ['email', 'Admin Email', 'email'], ['adminId', 'Admin ID', 'text'], ['phone', 'Phone', 'tel'], ['department', 'Department', 'text']].map(([id, label, type]) => (
                            <div key={id}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                                <input type={type} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                            <input value="Administrator" disabled className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-400" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="About yourself..." />
                        </div>
                    </div>
                    {saved && <div className="flex items-center gap-2 py-2 px-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium"><i className="fas fa-check-circle"></i> Saved!</div>}
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <i className="fas fa-save"></i> Save Profile
                    </button>
                </form>
            )}

            {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-800 mb-4">Change Password</h3>
                    {[['current', 'Current Password'], ['newPass', 'New Password'], ['confirm', 'Confirm Password']].map(([id, label]) => (
                        <div key={id}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                            <input type="password" value={passwordForm[id]} onChange={e => setPasswordForm({ ...passwordForm, [id]: e.target.value })} required className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                    ))}
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Update Password</button>
                </form>
            )}

            {activeTab === 'system' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">System Preferences</h3>
                    <div className="space-y-3">
                        {[['Email Notifications', 'Receive email alerts for new grievances'], ['Auto-assign Cases', 'Automatically assign cases when submitted'], ['Daily Report', 'Receive daily summary report']].map(([title, desc]) => (
                            <div key={title} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div><p className="font-semibold text-slate-800 text-sm">{title}</p><p className="text-xs text-slate-500 mt-0.5">{desc}</p></div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-checked:bg-blue-700 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                                </label>
                            </div>
                        ))}
                        <button onClick={() => alert('Preferences saved!')} className="w-full mt-2 py-3 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"><i className="fas fa-save mr-2"></i>Save Preferences</button>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-red-700 mb-3 text-sm">Danger Zone</h4>
                        <button onClick={() => { if (window.confirm('Clear ALL demo data? This cannot be undone.')) { localStorage.removeItem(STORAGE_KEYS.GRIEVANCE_DB); localStorage.removeItem(STORAGE_KEYS.ANON_GRIEVANCE_DB); localStorage.removeItem('mails'); localStorage.removeItem('notices'); alert('Data cleared.'); } }} className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">Clear Demo Data</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEditProfile;
