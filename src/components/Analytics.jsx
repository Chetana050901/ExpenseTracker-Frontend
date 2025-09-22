import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setAnalyticsFilters } from '../store/analyticsSlice';

const Analytics = () => {
    const dispatch = useDispatch();
    const [selectedMonth, setSelectedMonth] = useState('September');
    const [selectedYear, setSelectedYear] = useState('2025');
    const { analytics: analyticsData, loading } = useSelector(state => state.analytics);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [2023, 2024, 2025];

    // Fetch analytics when filters change
    useEffect(() => {
        dispatch(setAnalyticsFilters({ year: selectedYear, month: selectedMonth }));
        dispatch(fetchAnalytics({ year: selectedYear, month: selectedMonth }));
    }, [dispatch, selectedMonth, selectedYear]);

    // Fallback "no data" placeholder
    const greyExpenses = [
        { name: 'No Data', value: 100, amount: 0, color: '#D1D5DB' } // grey-300
    ];

    // Transform expenses for top 4 + Other
    const transformExpenses = (expenses) => {
        if (!expenses || expenses.length === 0) return greyExpenses;
        if (expenses.length <= 4) return expenses;
        const sorted = [...expenses].sort((a, b) => b.value - a.value);
        const topFour = sorted.slice(0, 4);
        const otherTotal = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
        const otherAmount = sorted.slice(4).reduce((sum, item) => sum + item.amount, 0);
        topFour.push({
            name: "Other",
            value: otherTotal,
            amount: otherAmount,
            color: "#9CA3AF"
        });
        return topFour;
    };

    // Always ensure displayData.expenses is an array
    const rawExpenses = analyticsData?.expenses && analyticsData.expenses.length > 0 ? analyticsData.expenses : greyExpenses;

    const displayData = {
        income: analyticsData?.income || 0,
        expenses: transformExpenses(rawExpenses) || greyExpenses
    };

    const totalIncome = displayData.income;
    const totalExpenses = displayData.expenses.reduce((sum, i) => sum + i.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
        ? Math.round((netSavings / totalIncome) * 100)
        : 0;

    const monthlyData = [{
        month: `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`,
        Income: totalIncome,
        Expenses: totalExpenses
    }];

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-2 border border-gray-200 rounded-lg shadow text-xs">
                    <p className="font-semibold text-gray-800">{data.name}</p>
                    <p className="text-gray-600">Amount: ₹{data.payload.amount.toLocaleString()}</p>
                    <p className="text-gray-600">Percentage: {data.value}%</p>
                </div>
            );
        }
        return null;
    };

    const BarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 rounded-lg shadow text-xs">
                    <p className="font-semibold text-gray-800 mb-1">
                        {selectedMonth} {selectedYear}
                    </p>
                    {payload.map((entry, i) => (
                        <p key={i} style={{ color: entry.color }}>
                            {entry.dataKey}: ₹{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central" className="text-xs font-semibold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading analytics...</span>
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">Expense Analysis</h1>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-600">Month:</label>
                            <select
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                                {months.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-600">Year:</label>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                                {years.map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Summary Cards */}
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100">
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                        Summary - {selectedMonth} {selectedYear}
                    </h2>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {/* Total Income */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-2 sm:p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs font-medium">Total Income</p>
                                    <p className="text-base sm:text-lg font-bold">₹{totalIncome.toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-400 bg-opacity-30 rounded-full p-1 sm:p-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-1 sm:mt-2">
                                <span className="text-blue-100 text-xs">Monthly income</span>
                            </div>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md p-2 sm:p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-xs font-medium">Total Expenses</p>
                                    <p className="text-base sm:text-lg font-bold">₹{totalExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-red-400 bg-opacity-30 rounded-full p-1 sm:p-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-1 sm:mt-2">
                                <span className="text-red-100 text-xs">Monthly expenses</span>
                            </div>
                        </div>

                        {/* Net Savings */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-2 sm:p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-xs font-medium">Net Savings</p>
                                    <p className="text-base sm:text-lg font-bold">₹{netSavings.toLocaleString()}</p>
                                </div>
                                <div className="bg-green-400 bg-opacity-30 rounded-full p-1 sm:p-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-1 sm:mt-2">
                                <span className="text-green-100 text-xs">
                                    {netSavings >= 0 ? 'Surplus' : 'Deficit'}
                                </span>
                            </div>
                        </div>

                        {/* Savings Rate */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-2 sm:p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-xs font-medium">Savings Rate</p>
                                    <p className="text-base sm:text-lg font-bold">{savingsRate}%</p>
                                </div>
                                <div className="bg-purple-400 bg-opacity-30 rounded-full p-1 sm:p-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-1 sm:mt-2">
                                <span className="text-purple-100 text-xs">
                                    {savingsRate >= 20 ? 'Excellent!' : savingsRate >= 10 ? 'Good rate' : 'Needs improvement'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                        Expense Distribution - {selectedMonth} {selectedYear}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-40 sm:h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayData.expenses}
                                        cx="50%" cy="50%" labelLine={false}
                                        label={renderCustomizedLabel} outerRadius={80}
                                        dataKey="value" stroke="#ffffff" strokeWidth={2}
                                    >
                                        {displayData.expenses.map((e, i) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                            {displayData.expenses.map((e, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                                        <span className="text-xs font-medium text-gray-700">{e.name}</span>
                                        <span className="text-xs text-gray-500">({e.value}%)</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800">₹{e.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expense Distribution Legend */}
                    {analyticsData && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-center">
                                <div className="text-sm font-semibold text-gray-700">
                                    Total Expenses: ₹{totalExpenses.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                        Income vs Expenses - {selectedMonth} {selectedYear}
                    </h3>
                    <div className="h-40 sm:h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month" axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#6B7280' }}
                                    tickFormatter={() => `${selectedMonth.slice(0, 3)} ${selectedYear}`}
                                />
                                <YAxis
                                    axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#6B7280' }}
                                    tickFormatter={v => `₹${v / 1000}k`}
                                />
                                <Tooltip content={<BarTooltip />} />
                                <Bar dataKey="Income" fill={analyticsData ? '#10B981' : '#D1D5DB'} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expenses" fill={analyticsData ? '#EF4444' : '#9CA3AF'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Income vs Expenses Legend - Only show when data is available */}
                    {analyticsData && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded bg-green-500"></div>
                                    <span className="text-sm text-gray-700">Income ₹{totalIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded bg-red-500"></div>
                                    <span className="text-sm text-gray-700">Expenses ₹{totalExpenses.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Analytics;
