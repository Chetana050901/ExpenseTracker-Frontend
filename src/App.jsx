import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ExpenseTracker from './components/ExpenseTracker';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/expense-tracker"
            element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
      />
    </>
  );
};

export default App;
