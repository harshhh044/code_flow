import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'student',
    uid: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return { text: 'Weak password', color: 'text-red-500' };
    if (passwordStrength <= 3) return { text: 'Medium strength', color: 'text-amber-500' };
    return { text: 'Strong password', color: 'text-emerald-500' };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.role) newErrors.role = 'Please select a role';
    if (!formData.uid.trim()) newErrors.uid = 'UID is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.terms) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Send real registration data to backend
      const result = await authAPI.register({
        fullName: formData.fullName,
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        uid: formData.uid,
        studentId: formData.uid,
        rollNo: formData.uid,
        phone: formData.phone,
      });

      if (!result.success) {
        // Show backend error (e.g. "email already exists")
        const msg = result.data?.message || 'Registration failed. Please try again.';
        if (msg.toLowerCase().includes('email')) {
          setErrors({ email: msg });
        } else {
          setErrors({ general: msg });
        }
        setLoading(false);
        return;
      }

      // Auto-login: backend returned token + user
      const { token, user } = result.data;
      if (token && user) {
        login(user, token);
        // Redirect straight to dashboard after register
        navigate(formData.role === 'admin' ? '/admin' : '/user');
      } else {
        // No auto-login from backend — redirect to login page
        alert(`✅ Account created successfully!\n\nYou can now login with:\nEmail: ${formData.email}`);
        navigate('/login');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      setErrors({ general: 'Unable to connect to server. Please make sure the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getStrengthText();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Promo Side - Left */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 to-teal-600 flex flex-col justify-center items-center px-6 py-12 lg:px-12 relative overflow-hidden text-white text-center min-h-[300px] lg:min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_20s_linear_infinite]"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)' }}
          ></div>
        </div>
        <div className="absolute -top-32 -right-24 w-72 h-72 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/5"></div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8 text-2xl font-extrabold">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-code-branch"></i>
            </div>
            Code Flow
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-2 leading-tight">Already Registered?</h2>
          <p className="text-xl font-semibold opacity-90 mb-2">Welcome back!</p>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Login to access your dashboard, track your complaints, and manage your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <i className="fas fa-sign-in-alt"></i>
            Login
          </Link>
          <div className="mt-12 space-y-3 text-left">
            {['Access your complaint history', 'Real-time status updates', 'Secure document uploads'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm opacity-90">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs flex-shrink-0">
                  <i className="fas fa-check"></i>
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side - Right */}
      <div className="flex-1 bg-white flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-28 relative z-10 overflow-y-auto">
        <Link to="/" className="absolute top-6 right-6 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-medium">
          Back to Home <i className="fas fa-arrow-right"></i>
        </Link>

        <div className="mb-6 mt-8 lg:mt-0">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-500">Join us to start resolving your grievances</p>
        </div>

        {/* General error banner */}
        {errors.general && (
          <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-md">
            <i className="fas fa-exclamation-circle"></i>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1"><i className="fas fa-exclamation-circle text-xs mr-1"></i>{errors.fullName}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Select Role</label>
            <div className="relative">
              <i className="fas fa-user-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <select
                name="role" value={formData.role} onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white ${errors.role ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* UID */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Unique ID (UID)</label>
            <div className="relative">
              <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text" name="uid" value={formData.uid} onChange={handleChange}
                placeholder="e.g. CS2023001 or ADMIN001"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.uid ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            {errors.uid && <p className="text-red-500 text-sm mt-1">{errors.uid}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
            <div className="relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="john.doe@example.com"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="Create a strong password (min 8 chars)"
                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900">
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${getStrengthColor()}`} style={{ width: `${(passwordStrength / 4) * 100}%` }}></div>
                </div>
                <p className={`text-xs mt-1 ${strengthInfo.color}`}>{strengthInfo.text}</p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox" name="terms" id="terms" checked={formData.terms} onChange={handleChange}
              className="w-5 h-5 accent-blue-900 cursor-pointer mt-0.5 flex-shrink-0"
            />
            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed cursor-pointer">
              I agree to the <a href="#" className="text-blue-900 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-blue-900 font-semibold hover:underline">Privacy Policy</a>.
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm flex items-center gap-1"><i className="fas fa-exclamation-circle text-xs"></i>{errors.terms}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl text-lg font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating Account...</> : 'Create Account'}
          </button>

          <p className="text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-900 font-bold hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
