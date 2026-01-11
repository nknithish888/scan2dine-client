import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    TrendingUp,
    UtensilsCrossed,
    Users,
    Plus,
    Loader2,
    DollarSign,
    ShoppingBag,
    Wallet,
    Store
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import api from '../config/api';

const RestaurantDashboardPage = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/orders/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-8 rounded-3xl text-center border-2 border-red-100">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const statCards = [
        {
            label: "Net Profit (Total)",
            value: `\u20b9${((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            trend: 'Overall earnings'
        },
        {
            label: "Today's Profit",
            value: `\u20b9${((stats?.todayRevenue || 0) - (stats?.todayExpenses || 0)).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100',
            trend: 'Daily performance'
        },
        {
            label: "Today's Expense",
            value: `\u20b9${stats?.todayExpenses?.toLocaleString() || 0}`,
            icon: ShoppingBag,
            color: 'text-red-600',
            bg: 'bg-red-100',
            trend: 'Cost tracking'
        },
        {
            label: "Total Sales",
            value: `\u20b9${stats?.totalRevenue?.toLocaleString() || 0}`,
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            trend: 'Gross revenue'
        },
    ];

    // Format merged sales and expense history for the graph
    const chartData = [];
    const salesMap = new Map(stats?.salesHistory?.map(s => [s._id, s.total]) || []);
    const expenseMap = new Map(stats?.expenseHistory?.map(e => [e._id, e.total]) || []);

    // Get unique dates from both
    const allDates = Array.from(new Set([...salesMap.keys(), ...expenseMap.keys()])).sort();

    allDates.slice(-7).forEach(date => {
        chartData.push({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            revenue: salesMap.get(date) || 0,
            expense: expenseMap.get(date) || 0,
            profit: (salesMap.get(date) || 0) - (expenseMap.get(date) || 0)
        });
    });

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            <div className={`p-2 md:p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-lg md:text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="hidden md:block text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{stat.trend}</p>
                    </div>
                ))}
            </div>

            {/* Daily Liquidity Section */}
            <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:scale-125 transition-all duration-500">
                        <Wallet className="w-12 h-12 md:w-32 md:h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full animate-pulse"></span>
                            <p className="text-gray-400 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">Real-time</p>
                        </div>
                        <h3 className="text-white text-sm md:text-3xl font-black mb-2 md:mb-8 italic">Cash in Hand</h3>
                        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                            <span className="text-xl md:text-5xl font-black text-orange-500 tracking-tighter">₹{stats?.cashInHand?.toLocaleString() || 0}</span>
                            <div className="hidden md:block border-l-2 border-gray-700 pl-4 py-1">
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Physical Cash</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border-2 border-gray-50 relative overflow-hidden group hover:border-green-100 transition-all">
                    <div className="absolute top-0 right-0 p-2 md:p-4 opacity-[0.03] group-hover:scale-125 transition-all duration-500">
                        <Store className="w-12 h-12 md:w-32 md:h-32 text-black" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-gray-400 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">Digital</p>
                        </div>
                        <h3 className="text-gray-900 text-sm md:text-3xl font-black mb-2 md:mb-8 italic">Cash in Bank</h3>
                        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                            <span className="text-xl md:text-5xl font-black text-green-600 tracking-tighter">₹{stats?.bankBalance?.toLocaleString() || 0}</span>
                            <div className="hidden md:block border-l-2 border-gray-100 pl-4 py-1">
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Online/UPI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profit History Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Profit & Loss Analysis</h3>
                            <p className="text-gray-500 text-sm font-medium">Daily comparison of revenue vs. expenses</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                REVENUE
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                EXPENSE
                            </span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full min-w-0">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        tickFormatter={(value) => `\u20b9${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '20px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '15px'
                                        }}
                                        itemStyle={{ fontWeight: 800 }}
                                        labelStyle={{ color: '#1e293b', fontWeight: 900, marginBottom: '8px', fontSize: '14px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        name="Expense"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        strokeDasharray="10 5"
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                                <p className="font-bold">Not enough data to generate graph</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popularity/Status Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-8">Order Summary</h3>
                    <div className="h-[350px] w-full">
                        {stats?.statusBreakdown?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.statusBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={35}>
                                        {stats.statusBreakdown.map((entry, index) => {
                                            const colors = {
                                                pending: '#3b82f6',
                                                preparing: '#f59e0b',
                                                ready: '#10b981',
                                                served: '#8b5cf6',
                                                cancelled: '#ef4444'
                                            };
                                            return <Cell key={`cell-${index}`} fill={colors[entry._id] || '#94a3b8'} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                                <p className="font-bold">No orders yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription Info Card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-orange-500/20">
                <UtensilsCrossed className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl">
                        <h3 className="text-3xl font-black mb-3 italic tracking-tight">Level up your restaurant!</h3>
                        <p className="text-orange-50 text-lg font-medium">You are currently on the <span className="bg-white/20 px-3 py-1 rounded-lg font-black">{user.plan || 'Starter'}</span> plan. Modernize your service with automated orders and real-time tracking.</p>
                    </div>
                    <button className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95 whitespace-nowrap">
                        View Upgrade Options
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboardPage;
