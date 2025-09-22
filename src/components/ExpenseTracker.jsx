import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import Analytics from './Analytics';
import Transactions from './Transactions';
import { useNavigate } from 'react-router-dom'; 
const ExpenseTracker = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user'); 
        localStorage.removeItem('token');
        navigate('/'); 
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-lg">
                <div className="px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <div
                            className="text-white rounded-lg p-1.5 mr-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <span className="font-bold text-sm">ET</span>
                        </div>
                        <h1 className="text-xl font-bold text-white">ExpenseTracker</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors rounded px-2 py-1"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            >
                                <span className="text-sm font-medium">{user?.username}</span>
                                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                                    {user?.profileImage ? (
                                        <img
                                            src={`${import.meta.env.VITE_BACK_URL}${user?.profileImage}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={14} className="text-white" />
                                    )}
                                </div>
                                <ChevronDown size={14} className="text-purple-200" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-1 w-45 text-left bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="w-full px-3 py-2 text-sm text-gray-700 border-b border-gray-200">
                                        {user?.email}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full cursor-pointer px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <LogOut size={14} className="mr-2" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-13 p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
                <Analytics />
                <Transactions />
            </main>
        </div>
    );
};

export default ExpenseTracker;
