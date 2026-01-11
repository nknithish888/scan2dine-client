import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Mail,
    Phone,
    Calendar,
    Heart,
    Award,
    Loader2,
    Filter
} from 'lucide-react';
import api from '../config/api';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchCustomers();
        fetchStats();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            if (response.data.success) {
                setCustomers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/customers/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);

        const matchesFilter =
            filterType === 'all' ||
            (filterType === 'active' && customer.totalOrders > 0) ||
            (filterType === 'inactive' && customer.totalOrders === 0);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Customer Management</h2>
                    <p className="text-gray-500 font-medium">Track and manage customer data across all restaurants</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-12 h-12 text-white/80" />
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black mb-2">{stats.totalCustomers}</h3>
                        <p className="text-blue-100 font-bold">Total Customers</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[2rem] p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <ShoppingCart className="w-12 h-12 text-white/80" />
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black mb-2">{stats.activeCustomers}</h3>
                        <p className="text-green-100 font-bold">Active Customers</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-12 h-12 text-white/80" />
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black mb-2">₹{stats.totalRevenue.toFixed(2)}</h3>
                        <p className="text-orange-100 font-bold">Total Revenue</p>
                    </div>
                </div>
            )}

            {/* Filter Buttons */}
            <div className="flex gap-3">
                {['all', 'active', 'inactive'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setFilterType(filter)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${filterType === filter
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {filter} Customers
                    </button>
                ))}
            </div>

            {/* Customers Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-xl font-bold text-gray-900">Loading customers...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border-4 border-dashed border-gray-100">
                    <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Customers Found</h3>
                    <p className="text-gray-500 font-medium">Customers will appear here as they register</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Loyalty Points</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Last Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-bold text-gray-900">{customer.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {customer.totalOrders > 0 && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Active</span>
                                                    )}
                                                    {customer.favoriteRestaurants?.length > 0 && (
                                                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black">
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-green-600 text-lg">
                                                ₹{customer.totalSpent.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Award className="w-5 h-5 text-orange-500" />
                                                <span className="font-black text-orange-600">{customer.loyaltyPoints}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {customer.lastOrderDate ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Never</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;
