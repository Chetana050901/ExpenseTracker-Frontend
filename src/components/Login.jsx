import React, { useState } from 'react';
import ETrackerInfo from './ETrackerInfo';
import InputField from '../reusablecontrols/InputField';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { toast } from 'react-toastify';
import {
  validateRequired,
} from '../utils/validations';

const Login = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

   const validateField = (field, value) => {
    const message = validateRequired(value) ? '' : 'This field is required';
    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === '';
  };

  const handleLogin = async () => {
    const emailValid = validateField('email', data.email);
    const passwordValid = validateField('password', data.password);
    if (!emailValid || !passwordValid) return;

    try {
      setLoading(true);
      const res = await loginUser(data.email, data.password);
      localStorage.setItem('token', res.token);
      const user = JSON.stringify(res.user);
      localStorage.setItem('user', user);
      toast.success(res.message || 'Login successful!');
      navigate('/expense-tracker');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className="hidden md:flex w-7/12">
        <ETrackerInfo />
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 w-5/12">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-gray-800 mb-1">ExpenseTracker</h1>
            <p className="text-sm text-gray-600">Welcome back! Please sign in.</p>
          </div>

          <InputField
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validateField('email', data.email)}
            placeholder="Enter email"
            required
            error={errors.email}
          />

          <InputField
            label="Password"
            type="password"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => validateField('password', data.password)}
            placeholder="Enter password"
            required
            error={errors.password}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white py-2 text-sm rounded-md font-medium hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-3 text-xs">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
