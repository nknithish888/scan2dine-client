import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Receipt,
    Calendar,
    PieChart,
    BarChart3,
    Download,
    Loader2,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../config/api';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];

const CustomTooltip = ({ active, payload, label, formatDate }) => {
    if (active && payload && payload.length) {
        return (
            <div className="flex flex-col items-center -translate-y-4">
                <div className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-full text-sm font-black shadow-2xl border border-white/10 flex items-center gap-2">
                    {payload[0].name === 'Revenue' ? '₹' : ''}{payload[0].value.toLocaleString()}
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1a1a1a]"></div>
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const [period, setPeriod] = useState('monthly');
    const [profitData, setProfitData] = useState(null);
    const [expenseBreakdown, setExpenseBreakdown] = useState(null);
    const [topItems, setTopItems] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [period]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const [profitRes, expenseRes] = await Promise.all([
                api.get(`/reports/profit?period=${period}`),
                api.get(`/reports/expense-breakdown?period=${period}`)
            ]);

            if (profitRes.data.success) {
                setProfitData(profitRes.data.data);
            }

            if (expenseRes.data.success) {
                setExpenseBreakdown(expenseRes.data.data);
            }

            const topItemsRes = await api.get(`/reports/top-items?period=${period}`);
            if (topItemsRes.data.success) {
                setTopItems(topItemsRes.data.data.topItems);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (period === 'yearly') {
            return date.toLocaleDateString('en-US', { month: 'short' });
        } else if (period === 'weekly') {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        }
    };

    const downloadReport = () => {
        if (!profitData) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const restaurantName = user.restaurantName || 'Restaurant';
        const today = new Date().toISOString().split('T')[0];
        const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

        // Create CSV header with restaurant info
        const csvContent = [
            [`${restaurantName} - Profit Report`],
            [`Period: ${periodLabel}`],
            [`Generated on: ${today}`],
            [''],
            ['Date', 'Revenue', 'Expenses', 'Profit', 'Orders'].join(','),
            ...profitData.timeline.map(row =>
                [row.date, row.revenue, row.expenses, row.profit, row.orderCount].join(',')
            ),
            [''],
            ['Summary'],
            [`Total Revenue,${profitData.summary.totalRevenue}`],
            [`Total Expenses,${profitData.summary.totalExpenses}`],
            [`Net Profit,${profitData.summary.totalProfit}`],
            [`Profit Margin,${profitData.summary.profitMargin}%`]
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Format: RestaurantName_Profit_Report_Monthly_2026-01-07.csv
        const filename = `${restaurantName.replace(/\s+/g, '_')}_Profit_Report_${periodLabel}_${today}.csv`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
                    <p className="text-gray-600 font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 mb-2">Profit Reports</h1>
                            <p className="text-gray-500 font-medium">Comprehensive analysis of your business performance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Period Selector */}
                            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
                                {['weekly', 'monthly', 'yearly'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${period === p
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            {/* Download Button */}
                            <button
                                onClick={downloadReport}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {profitData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Revenue */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                                    <span className="text-xs font-black uppercase tracking-wider">Revenue</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1">{formatCurrency(profitData.summary.totalRevenue)}</p>
                            <p className="text-sm opacity-90 font-medium">{profitData.summary.totalOrders} orders completed</p>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-red-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                                    <span className="text-xs font-black uppercase tracking-wider">Expenses</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1">{formatCurrency(profitData.summary.totalExpenses)}</p>
                            <p className="text-sm opacity-90 font-medium">{profitData.summary.totalExpenseRecords} expense records</p>
                        </div>

                        {/* Net Profit */}
                        <div className={`bg-gradient-to-br ${profitData.summary.totalProfit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} rounded-3xl p-6 text-white shadow-lg ${profitData.summary.totalProfit >= 0 ? 'shadow-blue-200' : 'shadow-orange-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                                    {profitData.summary.totalProfit >= 0 ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    <span className="text-xs font-black uppercase tracking-wider">Profit</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1">{formatCurrency(profitData.summary.totalProfit)}</p>
                            <p className="text-sm opacity-90 font-medium">
                                {profitData.summary.totalProfit >= 0 ? 'Net profit' : 'Net loss'} this {period}
                            </p>
                        </div>

                        {/* Profit Margin */}
                        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <PieChart className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                                    <span className="text-xs font-black uppercase tracking-wider">Margin</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black mb-1">{profitData.summary.profitMargin}%</p>
                            <p className="text-sm opacity-90 font-medium">Profit margin percentage</p>
                        </div>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Profit Timeline Chart */}
                    {profitData && (
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-w-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Sales Chart</h2>
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                        Your business performance at a glance
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={profitData.timeline}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDate}
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '700' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={15}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => value === 0 ? '0' : `₹${value >= 1000 ? value / 1000 + 'k' : value}`}
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '700' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip formatDate={formatDate} />}
                                            cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#f97316"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            name="Revenue"
                                            activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Expense Breakdown Pie Chart */}
                    {expenseBreakdown && expenseBreakdown.breakdown.length > 0 && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-w-0">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Expenses</h2>
                                    <p className="text-sm text-gray-500 font-medium mt-1">By category</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={expenseBreakdown.breakdown}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ category, percentage }) => `${category}: ${percentage}%`}
                                            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                        >
                                            {expenseBreakdown.breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                                fontWeight: 'bold'
                                            }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Category List */}
                            <div className="space-y-2 mt-6">
                                {expenseBreakdown.breakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="font-bold text-gray-700 text-sm">{item.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-sm">{formatCurrency(item.amount)}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.percentage}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Popular Dishes Section */}
                {topItems && topItems.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 mt-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Most Popular Dishes</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Your best-sellers this {period}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topItems.map((item, index) => (
                                <div key={index} className="relative group p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-orange-200 hover:bg-white transition-all duration-300">
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center font-black text-orange-600 border border-orange-50">
                                        #{index + 1}
                                    </div>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.isCombo ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600 shadow-inner'}`}>
                                            {item.isCombo ? <PieChart className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{item._id}</h4>
                                            <div className="flex items-center gap-2">
                                                {item.isCombo && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase">Combo Deal</span>
                                                )}
                                                <span className="text-xs font-bold text-gray-400 capitalize">{period} Trend</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 bg-white rounded-2xl border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Quantity</p>
                                            <p className="text-xl font-black text-gray-900">{item.totalQuantity}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-gray-100 group-hover:bg-green-50 group-hover:border-green-100 transition-colors">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Revenue</p>
                                            <p className="text-xl font-black text-green-600">{formatCurrency(item.totalRevenue)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                            <span>Average Price</span>
                                            <span className="text-gray-900">₹{Math.round(item.totalRevenue / item.totalQuantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Timeline Table */}
                {profitData && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Detailed Breakdown</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Day-by-day financial summary
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-100">
                                        <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="text-right py-4 px-4 text-xs font-black uppercase tracking-wider text-gray-500">Revenue</th>
                                        <th className="text-right py-4 px-4 text-xs font-black uppercase tracking-wider text-gray-500">Expenses</th>
                                        <th className="text-right py-4 px-4 text-xs font-black uppercase tracking-wider text-gray-500">Profit</th>
                                        <th className="text-center py-4 px-4 text-xs font-black uppercase tracking-wider text-gray-500">Orders</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profitData.timeline.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-gray-700">{formatDate(row.date)}</td>
                                            <td className="py-4 px-4 text-right font-black text-green-600">
                                                {formatCurrency(row.revenue)}
                                            </td>
                                            <td className="py-4 px-4 text-right font-black text-red-600">
                                                {formatCurrency(row.expenses)}
                                            </td>
                                            <td className={`py-4 px-4 text-right font-black ${row.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                {formatCurrency(row.profit)}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-700">
                                                    {row.orderCount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
