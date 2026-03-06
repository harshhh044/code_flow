import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQs from './pages/public/FAQs';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllGrievances from './pages/admin/AllGrievances';
import GrievanceReview from './pages/admin/GrievanceReview';
import GrievanceDetail from './pages/admin/GrievanceDetail';
import CheckStatus from './pages/admin/CheckStatus';
import EditProfile from './pages/admin/EditProfile';
import AccountActivity from './pages/admin/AccountActivity';
import InsightsDashboard from './pages/admin/InsightsDashboard';
import Mail from './pages/admin/Mail';
import NoticeBoard from './pages/admin/NoticeBoard';
import Guidelines from './pages/admin/Guidelines';
import ListGrievances from './pages/admin/ListGrievances';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import GrievanceForm from './pages/user/GrievanceForm';
import UserAllGrievances from './pages/user/AllGrievances';
import UserListGrievances from './pages/user/ListGrievances';
import UserGrievanceDetail from './pages/user/GrievanceDetail';
import UserCheckStatus from './pages/user/CheckStatus';
import UserEditProfile from './pages/user/EditProfile';
import UserInsightsDashboard from './pages/user/Insights';
import UserMail from './pages/user/Mail';
import UserNoticeBoard from './pages/user/NoticeBoard';
import UserGuidelines from './pages/user/Guidelines';
import ReviewPage from './pages/user/ReviewPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen font-inter">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faqs" element={<FAQs />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="grievances" element={<AllGrievances />} />
                <Route path="grievances/:code" element={<GrievanceDetail />} />
                <Route path="review/:code" element={<GrievanceReview />} />
                <Route path="list" element={<ListGrievances />} />
                <Route path="status" element={<CheckStatus />} />
                <Route path="profile" element={<EditProfile />} />
                <Route path="activity" element={<AccountActivity />} />
                <Route path="insights" element={<InsightsDashboard />} />
                <Route path="mail" element={<Mail />} />
                <Route path="notices" element={<NoticeBoard />} />
                <Route path="guidelines" element={<Guidelines />} />
              </Route>

              {/* User Routes - Protected */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<UserDashboard />} />
                <Route path="submit" element={<GrievanceForm />} />
                <Route path="grievances" element={<UserAllGrievances />} />
                <Route path="list" element={<UserListGrievances />} />
                <Route path="grievance/:code" element={<UserGrievanceDetail />} />
                <Route path="review/:code" element={<ReviewPage />} />
                <Route path="status" element={<UserCheckStatus />} />
                <Route path="profile" element={<UserEditProfile />} />
                <Route path="insights" element={<UserInsightsDashboard />} />
                <Route path="mail" element={<UserMail />} />
                <Route path="notices" element={<UserNoticeBoard />} />
                <Route path="guidelines" element={<UserGuidelines />} />
              </Route>

              {/* Catch all - 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;