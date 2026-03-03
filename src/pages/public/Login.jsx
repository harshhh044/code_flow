import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ role: '', uid: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Check against stored users
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const found = users.find(u =>
        u.email === formData.email &&
        u.password === formData.password &&
        u.role === formData.role
      );

      if (!found) {
        setError('Invalid credentials. Please check your role, email and password.');
        setLoading(false);
        return;
      }

      // Use AuthContext login — stores currentUser + authToken
      const token = 'token_' + Date.now();
      login(found, token);

      // Redirect based on role
      if (found.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 py-12 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors">
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </Link>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Sign in to access your grievance dashboard</p>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Select Role</label>
              <div className="relative">
                <i className="fas fa-user-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <select
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            {/* UID */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Unique ID (UID)</label>
              <div className="relative">
                <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Enter your UID"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-blue-900" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-900 font-semibold hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-900 font-bold hover:underline">Create Account</Link>
          </div>
        </div>
      </div>

      {/* Promo Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 to-teal-600 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_60%)]"></div>
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-code-branch text-2xl"></i>
            </div>
            <span className="text-3xl font-extrabold">Code Flow</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Don't Have an Account?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of students who trust our platform for resolving grievances.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:shadow-2xl transition-all"
          >
            <i className="fas fa-user-plus"></i>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;