import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService, detectEmailTypo } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ role: '', uid: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    // Check for typos in real-time
    const typo = detectEmailTypo(email);
    setEmailSuggestion(typo.hasTypo ? typo.suggestion : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailSuggestion('');
    setLoading(true);


export default Login;
