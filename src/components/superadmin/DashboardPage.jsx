import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    Store,
    DollarSign,
    BarChart3,
    TrendingUp,
    Clock,
    ChevronRight,
    PlusCircle,
    Loader2
} from 'lucide-react';
import api from '../config/api';

const Dashboard = ({ onAddClick }) => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/auth/superadmin/restaurants');
                if (response.data.success) {
                    setRestaurants(response.data.restaurants.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const stats = [
        { title: 'Total Restaurants', value: restaurants.length, icon: Store, color: 'text-orange-600', bg: 'bg-orange-100', trend: '+12%' },
        { title: 'Total Users', value: '1,242', icon: Users, color: 'text-green-600', bg: 'bg-green-100', trend: '+5.4%' },
        { title: 'Revenue (MTD)', value: '$12,210', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+8.2%' },
        { title: 'Active Subscriptions', value: restaurants.length, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+2.1%' },
    ];

    return (
        <div className="animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Restaurants Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Recent Onboarding</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onAddClick}
                                className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add New
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurant</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                                        </td>
                                    </tr>
                                ) : restaurants.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No restaurants onboarded yet.
                                        </td>
                                    </tr>
                                ) : restaurants.map((restaurant, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/superadmin/restaurants/${restaurant._id}`}
                                                className="font-bold text-gray-900 hover:text-orange-500 transition-all block"
                                            >
                                                {restaurant.restaurantName}
                                            </Link>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> {new Date(restaurant.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{restaurant.ownerName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${restaurant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                                restaurant.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {restaurant.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center text-xs font-bold text-green-600">
                                                <span className="w-2 h-2 rounded-full mr-2 bg-green-600"></span>
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Analytics Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-6">Subscription Distribution</h3>
                    <div className="space-y-6">
                        {[
                            {
                                label: 'Pro Plan', count: restaurants.filter(r => r.plan === 'Pro').length, color: 'bg-blue-500',
                                percent: restaurants.length ? (restaurants.filter(r => r.plan === 'Pro').length / restaurants.length) * 100 : 0
                            },
                            {
                                label: 'Starter Plan', count: restaurants.filter(r => r.plan === 'Starter').length, color: 'bg-orange-500',
                                percent: restaurants.length ? (restaurants.filter(r => r.plan === 'Starter').length / restaurants.length) * 100 : 0
                            },
                            {
                                label: 'Enterprise', count: restaurants.filter(r => r.plan === 'Enterprise').length, color: 'bg-purple-500',
                                percent: restaurants.length ? (restaurants.filter(r => r.plan === 'Enterprise').length / restaurants.length) * 100 : 0
                            },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                                    <span className="text-xs font-bold text-gray-400">{item.count}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl text-white relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 transform group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="font-bold text-lg mb-2">Platform Growth</h4>
                        <p className="text-orange-50 text-sm mb-4">Onboarding process is active. Monitor restaurants and subscriptions here.</p>
                        <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                            View Full Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
