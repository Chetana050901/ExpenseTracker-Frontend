import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};
