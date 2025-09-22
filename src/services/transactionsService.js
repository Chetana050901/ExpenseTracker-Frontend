import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/transactions`
  : 'http://localhost:5000/api/transactions';

/* ---------------------- AXIOS INSTANCE ---------------------- */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------- CATEGORY APIs ---------------------- */
export const createCategory = async (data) => {
  try {
    const res = await api.post('/categories', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Create category failed' };
  }
};

export const getCategories = async (type = '') => {
  try {
    const url = type ? `/categories?type=${type}` : '/categories';
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetch categories failed' };
  }
};


/* -------------------- TRANSACTION APIs -------------------- */
export const createTransaction = async (data) => {
  try {
    const res = await api.post('/transactions', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Create transaction failed' };
  }
};

export const getTransactions = async (filters = {}) => {
  try {
    const { type, start, end, category } = filters;
    const queryParts = [];

    if (type) queryParts.push(`type=${type}`);
    if (category) queryParts.push(`category=${category}`); // <-- new
    if (start && end) queryParts.push(`start=${start}&end=${end}`);

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    const res = await api.get(`/transactions${queryString}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetch transactions failed' };
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Update transaction failed' };
  }
};

export const deleteTransaction = async (id) => {
  try {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Delete transaction failed' };
  }
};

/* -------------------- Analytics APIs -------------------- */
export const getAnalytics = async (filters = {}) => {
  try {
    const { year, month } = filters;

    if (!year) throw { message: 'Year is required' };

    const queryParts = [`year=${year}`];
    if (month) queryParts.push(`month=${month}`);

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    const res = await api.get(`/analytics${queryString}`);

    return res.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Fetch analytics failed' };
  }
};