import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import grievanceService from '../../services/grievanceService';

const AccountActivity = () => {
    const [view, setView] = useState('list'); // 'list' or 'details'
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, restricted: 0, removed: 0 });
    const [loading, setLoading] = useState(true);

    // Modals
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [supportTab, setSupportTab] = useState('new');
    const [resetData, setResetData] = useState({ password: '', studentId: '', email: '', phone: '', roll: '', dept: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [allUsers, userStats, allGrievances] = await Promise.all([
                    userService.getUsers(),
                    userService.getStats(),
                    grievanceService.getAllGrievances()
                ]);

                // Create a map of email -> complaint count
                const counts = {};
                if (Array.isArray(allGrievances)) {
                    allGrievances.forEach(g => {
                        const email = g.userEmail;
                        if (email) {
                            counts[email] = (counts[email] || 0) + 1;
                        }
                    });
                }

                // Inject counts into user objects
                const usersWithCounts = Array.isArray(allUsers)
                    ? allUsers.map(u => ({ ...u, complaints: counts[u.email] || 0 }))
                    : [];

                setUsers(usersWithCounts);
                setStats(userStats || { total: 0, active: 0, blocked: 0, restricted: 0, removed: 0 });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setResetData({
            password: '',
            studentId: user.studentId,
            email: user.email,
            phone: user.phone,
            roll: user.roll,
            dept: user.dept
        });
        setView('details');
    };

    const handleStatusChange = async (status) => {
        if (!selectedUser) return;
        try {
            await userService.updateUserStatus(selectedUser._id || selectedUser.id, status);

            // Refresh counts and users
            const [allUsers, userStats, allGrievances] = await Promise.all([
                userService.getUsers(),
                userService.getStats(),
                grievanceService.getAllGrievances()
            ]);

            const counts = {};
            if (Array.isArray(allGrievances)) {
                allGrievances.forEach(g => {
                    const email = g.userEmail;
                    if (email) {
                        counts[email] = (counts[email] || 0) + 1;
                    }
                });
            }

            const usersWithCounts = Array.isArray(allUsers)
                ? allUsers.map(u => ({ ...u, complaints: counts[u.email] || 0 }))
                : [];

            setUsers(usersWithCounts);
            setStats(userStats);

            // Update selected user
            const updated = usersWithCounts.find(u => (u._id || u.id) === (selectedUser._id || selectedUser.id));
            if (updated) setSelectedUser(updated);

        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            await userService.updateProfile(resetData);
            alert('User data updated successfully');

            // Refresh data
            const [allUsers, userStats, allGrievances] = await Promise.all([
                userService.getUsers(),
                userService.getStats(),
                grievanceService.getAllGrievances()
            ]);

            const counts = {};
            if (Array.isArray(allGrievances)) {
                allGrievances.forEach(g => {
                    const email = g.userEmail;
                    if (email) {
                        counts[email] = (counts[email] || 0) + 1;
                    }
                });
            }

            const usersWithCounts = Array.isArray(allUsers)
                ? allUsers.map(u => ({ ...u, complaints: counts[u.email] || 0 }))
                : [];

            setUsers(usersWithCounts);
            setStats(userStats);

            const updated = usersWithCounts.find(u => u.email === resetData.email);
            if (updated) setSelectedUser(updated);
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Failed to update user");
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        const matchesSearch = (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.uid || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = statusFilter === 'all' || u.status === statusFilter;
        return matchesSearch && matchesFilter;
    }) : [];

    if (loading) return <div className="p-10 text-center animate-pulse">Loading User Directory...</div>;

    return (
        <div className="min-h-screen bg-[#f4f7fa] -m-4 p-4 md:-m-8 md:p-8 transition-colors duration-300">
            <div className="pb-20 mx-auto max-w-7xl">
                {view === 'list' ? (
                    <div className="duration-500 animate-in fade-in">
                        {/* Page Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                                <span>Dashboard</span>
                                <i className="fas fa-chevron-right text-[10px]"></i>
                                <span className="font-medium text-slate-900">Account Activity</span>
                            </div>
                            <h1 className="mb-1 text-3xl font-bold text-slate-900">Account Activity & User Access</h1>
                            <p className="text-slate-500">Manage user accounts, permissions, and system access</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3 lg:grid-cols-5">
                            {[
                                { label: 'Total Users', val: stats.total, icon: 'fa-users', color: 'blue', status: 'all' },
                                { label: 'Active Users', val: stats.active, icon: 'fa-user-check', color: 'emerald', status: 'active' },
                                { label: 'Blocked', val: stats.blocked, icon: 'fa-shield-alt', color: 'red', status: 'blocked' },
                                { label: 'Restricted', val: stats.restricted, icon: 'fa-exclamation-triangle', color: 'amber', status: 'restricted' },
                                { label: 'Removed', val: stats.removed, icon: 'fa-user-times', color: 'slate', status: 'removed' }
                            ].map((s) => (
                                <div
                                    key={s.status}
                                    onClick={() => setStatusFilter(s.status)}
                                    className={`bg-white p-6 rounded-2xl border ${statusFilter === s.status ? `border-${s.color}-500 ring-2 ring-${s.color}-50` : 'border-slate-200'} shadow-sm transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
                                >
                                    <div className={`w-12 h-12 bg-${s.color}-100 text-${s.color}-600 rounded-xl flex items-center justify-center text-xl mb-4`}>
                                        <i className={`fas ${s.icon}`}></i>
                                    </div>
                                    <div className="mb-1 text-sm text-slate-600">{s.label}</div>
                                    <div className="text-3xl font-bold text-slate-900">{s.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* User Table Card */}
                        <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                            <div className="flex flex-col justify-between gap-4 p-6 border-b border-slate-100 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                                    <p className="text-sm text-slate-500">View and manage all user accounts</p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="relative">
                                        <i className="absolute font-bold -translate-y-1/2 fas fa-search left-3 top-1/2 text-slate-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 pr-4 py-2.5 w-64 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm bg-white font-medium"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="restricted">Restricted</option>
                                        <option value="removed">Removed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                            <th className="px-6 py-4">University UID</th>
                                            <th className="px-6 py-4">User Name</th>
                                            <th className="px-6 py-4">Department</th>
                                            <th className="px-6 py-4">Complaints</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-50">
                                        {filteredUsers.map((user, idx) => (
                                            <tr key={user.id || user.email || idx} className="transition-colors hover:bg-slate-50 group">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{user.uid}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center font-bold transition-all rounded-full w-9 h-9 bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white">
                                                            {(user.fullName || user.name || 'U').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{user.fullName || user.name}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{user.dept}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900">{user.complaints || 0}</span>
                                                        <span className="text-xs text-slate-500">filed</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        user.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                            user.status === 'restricted' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewDetails(user)}
                                                        className="px-4 py-2 text-xs font-bold text-white transition-all shadow-lg bg-slate-900 rounded-xl hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-200"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="duration-500 animate-in slide-in-from-right">
                        {/* Detail Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView('list')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl border border-slate-200 transition-all font-bold group"
                                >
                                    <i className="transition-transform fas fa-arrow-left group-hover:-translate-x-1"></i>
                                    <span>Back to Users</span>
                                </button>
                                <div className="w-px h-8 bg-slate-300"></div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
                                    <p className="text-sm text-slate-500">Manage individual user information</p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border-2 ${selectedUser.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                selectedUser.status === 'blocked' ? 'bg-red-50 text-red-700 border-red-100' :
                                    selectedUser.status === 'restricted' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                {selectedUser.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* User Profile Info */}
                            <div className="space-y-6">
                                <div className="p-8 bg-white border shadow-sm rounded-3xl border-slate-200">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center justify-center text-2xl text-white shadow-xl w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-blue-100">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</div>
                                                <div className="font-bold text-slate-900">{selectedUser.fullName || selectedUser.name}</div>
                                            </div>
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">University UID</div>
                                                <div className="font-mono italic font-bold text-slate-900">{selectedUser.uid}</div>
                                            </div>
                                        </div>

                                        <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Course / Department</div>
                                            <div className="font-bold text-slate-900">{selectedUser.dept}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Roll Number</div>
                                                <div className="font-mono font-bold text-slate-900">{selectedUser.roll}</div>
                                            </div>
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student ID</div>
                                                <div className="font-mono font-bold text-slate-900">{selectedUser.studentId}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                                                <div className="text-sm font-bold truncate text-slate-900">{selectedUser.email}</div>
                                            </div>
                                            <div className="p-4 border bg-slate-50 rounded-2xl border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</div>
                                                <div className="text-sm font-bold text-slate-900">{selectedUser.phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reset Data Form */}
                                <div className="p-8 bg-white border shadow-sm rounded-3xl border-slate-200">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center justify-center text-2xl text-purple-600 bg-purple-100 shadow-xl w-14 h-14 rounded-2xl shadow-purple-50">
                                            <i className="fas fa-sync-alt"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Update Account Data</h3>
                                    </div>

                                    <form onSubmit={handleResetSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-500">Reset Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="New password"
                                                    className="w-full px-4 py-3 font-mono transition-all border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-purple-300"
                                                    value={resetData.password}
                                                    onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-500">Student ID</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 font-mono transition-all border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-purple-300"
                                                    value={resetData.studentId}
                                                    onChange={(e) => setResetData({ ...resetData, studentId: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-500">University Email</label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-3 transition-all border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-purple-300"
                                                    value={resetData.email}
                                                    onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                            <i className="mr-2 fas fa-save"></i> Save Changes & Sync
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Actions Sidebar */}
                            <div className="space-y-6">
                                {/* Status Control */}
                                <div className="p-8 bg-white border shadow-sm rounded-3xl border-slate-200">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center justify-center text-2xl text-orange-600 bg-orange-100 shadow-xl w-14 h-14 rounded-2xl shadow-orange-50">
                                            <i className="fas fa-bolt"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Access Control</h3>
                                    </div>

                                    <div className="p-6 mb-8 border bg-slate-50 rounded-2xl border-slate-100">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Modify Account Status</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { val: 'active', label: 'Active', color: 'emerald' },
                                                { val: 'blocked', label: 'Block', color: 'red' },
                                                { val: 'restricted', label: 'Restrict', color: 'amber' },
                                                { val: 'removed', label: 'Remove', color: 'slate' }
                                            ].map(s => (
                                                <button
                                                    key={s.val}
                                                    onClick={() => handleStatusChange(s.val)}
                                                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all font-bold text-sm ${selectedUser.status === s.val
                                                        ? `bg-${s.color}-50 border-${s.color}-500 text-${s.color}-700`
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full bg-${s.color}-500 animate-pulse`}></div>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-800">Direct Message</h4>
                                        <textarea
                                            rows="3"
                                            placeholder="Reason for status change or internal notes..."
                                            className="w-full px-4 py-3 text-sm transition-all border-2 resize-none border-slate-100 rounded-2xl focus:outline-none focus:border-blue-300"
                                        ></textarea>
                                        <button className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-all bg-blue-600 shadow-xl rounded-2xl shadow-blue-200 hover:bg-blue-700">
                                            <i className="text-xs fas fa-paper-plane"></i> Notify Student via Email
                                        </button>
                                    </div>
                                </div>

                                {/* Impersonation Bridge */}
                                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 -mt-20 -mr-20 transition-transform rounded-full bg-white/10 blur-3xl group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center justify-center text-2xl border w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border-white/20">
                                                <i className="fas fa-external-link-alt"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">Impersonation Bridge</h3>
                                                <p className="text-sm text-indigo-200">Secure dashboard access</p>
                                            </div>
                                        </div>

                                        <div className="p-5 mb-8 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/10">
                                            <div className="flex items-start gap-3">
                                                <i className="mt-1 fas fa-shield-halved text-amber-400"></i>
                                                <p className="text-sm font-medium leading-relaxed text-indigo-100">
                                                    By accessing this dashboard, you will be able to view the system exactly as this user.
                                                    All actions are audited.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsImpersonateOpen(true)}
                                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-extrabold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-indigo-50"
                                        >
                                            Access Student Portal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Impersonation Modal */}
                {isImpersonateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsImpersonateOpen(false)}></div>
                        <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                            <div className="p-10 text-center">
                                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-4xl text-blue-600 bg-blue-100 shadow-inner rounded-3xl">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                                <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Bridge Authentication</h3>
                                <p className="mb-8 font-medium text-slate-500">Proceed to student portal as {selectedUser?.fullName}?</p>

                                <div className="p-6 mb-8 text-left border-2 bg-amber-50 border-amber-100 rounded-2xl">
                                    <div className="flex gap-4">
                                        <i className="text-xl fas fa-warning text-amber-600"></i>
                                        <div>
                                            <p className="mb-1 font-bold text-amber-900">Administrative Action</p>
                                            <p className="text-sm font-medium text-amber-700">This will temporarily switch your session. You can return to admin by clicking the 'Exit Impersonation' flag.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button className="w-full py-4 font-bold text-white transition-all bg-blue-600 shadow-xl rounded-2xl hover:bg-blue-700 shadow-blue-100">
                                        Confirm & Bridge Session
                                    </button>
                                    <button onClick={() => setIsImpersonateOpen(false)} className="w-full py-4 font-bold transition-all bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Modal (Technical Center) */}
                {isSupportOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSupportOpen(false)}></div>
                        <div className="bg-white rounded-[40px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl border border-white/20 animate-in slide-in-from-bottom-10 duration-500">
                            {/* Modal Header */}
                            <div className="relative p-8 text-white bg-gradient-to-r from-blue-700 to-indigo-800">
                                <button onClick={() => setIsSupportOpen(false)} className="absolute flex items-center justify-center w-10 h-10 transition-all rounded-full top-6 right-6 bg-white/10 hover:bg-white/20">
                                    <i className="fas fa-times"></i>
                                </button>
                                <h2 className="flex items-center gap-3 text-2xl font-extrabold">
                                    <i className="fas fa-headset"></i> Technical Support Center
                                </h2>
                                <p className="mt-2 font-medium text-blue-100">Report system issues or request developer assistance</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-2 border-b bg-slate-50 border-slate-100">
                                <button
                                    onClick={() => setSupportTab('new')}
                                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${supportTab === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <i className="mr-2 fas fa-plus-circle"></i> New Query
                                </button>
                                <button
                                    onClick={() => setSupportTab('history')}
                                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${supportTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <i className="mr-2 fas fa-history"></i> Query History
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                {supportTab === 'new' ? (
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400">Issue Type</label>
                                                <select className="w-full px-4 py-3 font-bold bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-300 text-slate-700">
                                                    <option>Bug Report</option>
                                                    <option>Feature Request</option>
                                                    <option>Performance</option>
                                                    <option>UI/UX Problem</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400">Priority</label>
                                                <select className="w-full px-4 py-3 font-bold bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-300 text-slate-700">
                                                    <option>Low</option>
                                                    <option>Medium</option>
                                                    <option>High</option>
                                                    <option>Urgent</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400">Subject</label>
                                            <input type="text" placeholder="Brief summary of the issue" className="w-full px-4 py-3 font-bold border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-300" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-slate-400">Details</label>
                                            <textarea rows="4" placeholder="Describe what happened and how to reproduce..." className="w-full px-4 py-3 font-medium border-2 resize-none border-slate-100 rounded-2xl focus:outline-none focus:border-blue-300"></textarea>
                                        </div>
                                        <button onClick={(e) => { e.preventDefault(); alert('Query submitted successfully!'); setIsSupportOpen(false); }} className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-all shadow-xl bg-slate-900 rounded-2xl shadow-slate-200 hover:bg-slate-800">
                                            <i className="mr-2 fas fa-paper-plane"></i> Submit Support Query
                                        </button>
                                    </form>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-2xl rounded-full bg-slate-100 text-slate-300">
                                            <i className="fas fa-inbox"></i>
                                        </div>
                                        <p className="font-bold text-slate-500">No previous queries found</p>
                                        <p className="text-sm text-slate-400">Your technical support history will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Support Trigger (Matches HTML's intent) */}
                <button
                    onClick={() => setIsSupportOpen(true)}
                    className="fixed z-50 flex items-center justify-center w-16 h-16 text-2xl text-white transition-all rounded-full shadow-2xl bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-200 hover:scale-110 active:scale-90 group"
                >
                    <i className="fas fa-headset"></i>
                    <span className="absolute px-4 py-2 mr-4 text-xs font-bold text-white transition-all translate-x-4 shadow-xl opacity-0 right-full bg-slate-900 rounded-xl group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                        Technical Support
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AccountActivity;