import { storageService } from './storageService';

const USERS_KEY = 'users'; // Aligned with Register.jsx and Login.jsx
const SESSIONS_KEY = 'currentUser';

export const userService = {
    getUsers: () => {
        const users = storageService.get(USERS_KEY, []);

        // Auto-patch users with status if missing (authentic records from registration)
        let needsUpdate = false;
        const patchedUsers = users.map(user => {
            if (!user.status) {
                needsUpdate = true;
                return {
                    ...user,
                    status: 'active',
                    // Map common fields for consistency
                    uid: user.uid || user.studentId || 'N/A',
                    dept: user.dept || 'Department Not Set',
                    roll: user.roll || 'N/A'
                };
            }
            return user;
        });

        if (needsUpdate) {
            storageService.set(USERS_KEY, patchedUsers);
        }

        return patchedUsers;
    },

    getUserById: (id) => {
        const users = userService.getUsers();
        // Since original users might not have 'id', we match by email or uid
        return users.find(u => u.id === id || u.email === id || u.uid === id);
    },

    updateUserStatus: (id, status) => {
        const users = userService.getUsers();
        const index = users.findIndex(u => u.id === id || u.email === id || u.uid === id);
        if (index !== -1) {
            users[index].status = status;
            users[index].lastUpdated = new Date().toISOString();
            storageService.set(USERS_KEY, users);

            // Log this activity
            userService.logActivity({
                type: 'Status Change',
                user: 'Admin',
                description: `Changed user ${users[index].fullName || users[index].name} status to ${status}`,
                date: new Date().toISOString()
            });

            return users[index];
        }
        return null;
    },

    resetUserData: (id, newData) => {
        const users = userService.getUsers();
        const index = users.findIndex(u => u.id === id || u.email === id || u.uid === id);
        if (index !== -1) {
            // Preserve core auth identification
            const updatedUser = {
                ...users[index],
                ...newData,
                lastUpdated: new Date().toISOString()
            };
            users[index] = updatedUser;
            storageService.set(USERS_KEY, users);

            userService.logActivity({
                type: 'Data Reset',
                user: 'Admin',
                description: `Updated profile data for ${users[index].fullName || users[index].name}`,
                date: new Date().toISOString()
            });

            return users[index];
        }
        return null;
    },

    logActivity: (log) => {
        const logs = storageService.get('activityLog', []);
        logs.unshift({
            id: Date.now(),
            ...log
        });
        storageService.set('activityLog', logs.slice(0, 100)); // Keep last 100
    },

    getActivityLogs: () => {
        return storageService.get('activityLog', []);
    },

    getStats: () => {
        const users = userService.getUsers();
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            blocked: users.filter(u => u.status === 'blocked').length,
            restricted: users.filter(u => u.status === 'restricted').length,
            removed: users.filter(u => u.status === 'removed').length
        };
    },

    // Get complaint count for a specific user
    getUserComplaints: (userEmail) => {
        try {
            const grievanceDB = storageService.get('grievanceDatabase', {});
            const anonDB = storageService.get('anonymousGrievanceDatabase', []);
            
            // Count grievances by user email
            let count = 0;
            
            // Count from regular database
            Object.values(grievanceDB).forEach(categoryGrievances => {
                if (Array.isArray(categoryGrievances)) {
                    count += categoryGrievances.filter(g => 
                        g.email === userEmail || 
                        g.uniEmail === userEmail || 
                        g.personalEmail === userEmail
                    ).length;
                }
            });
            
            return count;
        } catch (error) {
            console.error('[userService] Error getting user complaints:', error);
            return 0;
        }
    }
};

export default userService;
