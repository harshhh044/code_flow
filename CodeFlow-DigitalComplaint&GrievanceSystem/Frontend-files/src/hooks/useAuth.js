import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export from context for convenience
export const useAuth = useAuthContext;

// Additional auth-related hooks
export const useRequireAuth = () => {
  const { isAuthenticated, user, loading } = useAuthContext();
  
  return {
    isAuthenticated,
    user,
    loading,
    isReady: !loading,
    isAuthorized: isAuthenticated && !!user
  };
};

export const useRole = () => {
  const { user, isAdmin, isStudent } = useAuthContext();
  
  return {
    role: user?.role,
    isAdmin,
    isStudent,
    isGuest: !user
  };
};

export default useAuthContext;