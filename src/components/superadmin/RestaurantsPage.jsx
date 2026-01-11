import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Store,
    Search,
    Filter,
    ChevronRight,
    MoreVertical,
    PlusCircle,
    Loader2,
    Mail,
    User,
    Eye,
    EyeOff
} from 'lucide-react';
import api from '../config/api';

const PasswordToggle = ({ password }) => {
    return (
        <span className="text-xs font-black text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">
            {password || <span className="text-gray-400 font-bold italic text-[8px]">Hashed</span>}
        </span>
    );
};

const RestaurantsPage = ({ onAddClick }) => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/auth/superadmin/restaurants');
                if (response.data.success) {
                    setRestaurants(response.data.restaurants);
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const filteredRestaurants = restaurants.filter(r =>
        r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search restaurants, owners, or emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                        Filter
                    </button>
                    <button
                        onClick={onAddClick}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-md"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Restaurant
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurant Info</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Details</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" />
                                        <p className="mt-4 text-gray-500 font-medium font-sans">Loading establishments...</p>
                                    </td>
                                </tr>
                            ) : filteredRestaurants.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Store className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-bold text-lg font-sans">No restaurants found</p>
                                        <p className="text-gray-400 text-sm font-sans">Try adjusting your search or add a new restaurant owner.</p>
                                    </td>
                                </tr>
                            ) : filteredRestaurants.map((restaurant) => (
                                <tr key={restaurant._id} className="hover:bg-orange-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <Link
                                                to={`/superadmin/restaurants/${restaurant._id}`}
                                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300 shadow-sm font-sans font-bold text-lg"
                                            >
                                                {restaurant.restaurantName.charAt(0)}
                                            </Link>
                                            <div>
                                                <Link
                                                    to={`/superadmin/restaurants/${restaurant._id}`}
                                                    className="font-bold text-gray-900 font-sans text-base hover:text-orange-500 transition-colors block"
                                                >
                                                    {restaurant.restaurantName}
                                                </Link>
                                                <div className="text-sm text-gray-500 font-sans">Added {new Date(restaurant.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm font-sans">
                                                <User className="w-4 h-4 text-orange-400" />
                                                {restaurant.ownerName}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-sans">
                                                <Mail className="w-4 h-4 text-green-400" />
                                                {restaurant.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm ${restaurant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                            restaurant.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {restaurant.plan} Plan
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${restaurant.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${restaurant.isActive ? 'bg-green-600' : 'bg-red-600'
                                                }`}></span>
                                            {restaurant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <PasswordToggle password={restaurant.rawPassword} />
                                    </td>
                                    <td className="px-8 py-6 text-right text-sans font-bold">
                                        <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-orange-500 hover:shadow-sm transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <p className="text-sm text-gray-500 font-sans">
                        Showing <span className="font-bold text-gray-700">{filteredRestaurants.length}</span> of <span className="font-bold text-gray-700">{restaurants.length}</span> establishments
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold bg-white text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold bg-white text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantsPage;
