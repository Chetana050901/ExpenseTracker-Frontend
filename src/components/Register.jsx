import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import InputField from '../reusablecontrols/InputField';
import ETrackerInfo from './ETrackerInfo';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { toast } from 'react-toastify';
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from '../utils/validations';

const Register = () => {
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateField = (field, value) => {
    let message = '';
    if (!validateRequired(value)) {
      message = 'This field is required';
    } else if (field === 'email' && !validateEmail(value)) {
      message = 'Enter a valid email address';
    } else if (field === 'password' && !validatePassword(value)) {
      message =
        'Password must be at least 8 chars with uppercase, lowercase, number & special char';
    } else if (field === 'confirmPassword' && value !== data.password) {
      message = 'Passwords do not match';
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === '';
  };

  const validateAll = () => {
    const fields = ['username', 'email', 'password', 'confirmPassword'];
    const results = fields.map((f) => validateField(f, data[f]));
    return results.every((valid) => valid);
  };

  const handleRegister = async () => {
    if (!validateAll()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (imgFile) formData.append('profileImage', imgFile);

      const res = await registerUser(formData);
      localStorage.setItem('token', res.token);
      toast.success(res.message || 'Registration successful!');
      navigate('/'); // go to login
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden md:flex w-7/12">
        <ETrackerInfo />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 w-5/12">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-600">
              Get started with ExpenseTracker
            </p>
          </div>

          {/* Profile Upload */}
          <div className="mb-4 text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload size={20} />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600">
                <Upload size={12} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload Image</p>
          </div>

          <InputField
            label="Username"
            value={data.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => validateField('username', data.username)}
            placeholder="Username"
            required
            error={errors.username}
          />

          <InputField
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validateField('email', data.email)}
            placeholder="Email"
            required
            error={errors.email}
          />

          <InputField
            label="Password"
            type="password"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => validateField('password', data.password)}
            placeholder="Password"
            required
            error={errors.password}
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={data.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => validateField('confirmPassword', data.confirmPassword)}
            placeholder="Confirm Password"
            required
            error={errors.confirmPassword}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white py-2 text-sm rounded-md font-medium hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center mt-3 text-xs">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
