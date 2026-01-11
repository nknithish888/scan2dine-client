import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Store,
    Mail,
    User,
    Calendar,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Power,
    Trash2,
    Loader2,
    Save,
    Package,
    Users,
    TrendingUp,
    ChevronRight,
    X,
    Eye,
    EyeOff,
    History,
    Key
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import api from '../config/api';
import Popup from '../common/Popup';


const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [staff, setStaff] = useState([]);
    const [showProductsModal, setShowProductsModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [planAmount, setPlanAmount] = useState('');
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [popup, setPopup] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    });

    useEffect(() => {
        fetchRestaurantDetails();
        fetchAdditionalData();
    }, [id]);

    const fetchAdditionalData = async () => {
        try {
            setIsFetchingData(true);
            const [analyticsRes, productsRes, staffRes] = await Promise.all([
                api.get(`/auth/superadmin/restaurants/${id}/analytics`),
                api.get(`/auth/superadmin/restaurants/${id}/products`),
                api.get(`/auth/superadmin/restaurants/${id}/staff`)
            ]);

            if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
            if (productsRes.data.success) setProducts(productsRes.data.products);
            if (staffRes.data.success) setStaff(staffRes.data.staff);
        } catch (error) {
            console.error('Error fetching additional restaurant data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };

    const fetchRestaurantDetails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/auth/superadmin/restaurants/${id}`);
            if (response.data.success) {
                setRestaurant(response.data.restaurant);
                if (response.data.restaurant.dueDate) {
                    setDueDate(new Date(response.data.restaurant.dueDate).toISOString().split('T')[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (status) => {
        try {
            setIsUpdating(true);
            const response = await api.patch(`/auth/superadmin/restaurants/${id}/payment`, {
                paymentStatus: status
            });
            if (response.data.success) {
                setRestaurant(response.data.restaurant);
                setPopup({
                    isOpen: true,
                    title: 'Status Updated',
                    message: `Payment status has been successfully updated to ${status.toUpperCase()}.`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            setPopup({
                isOpen: true,
                title: 'Update Failed',
                message: 'Failed to update payment status. Please try again.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateDueDate = async () => {
        if (!dueDate) {
            setPopup({
                isOpen: true,
                title: 'Date Required',
                message: 'Please select a valid subscription due date.',
                type: 'warning'
            });
            return;
        }
        try {
            setIsUpdating(true);
            const response = await api.patch(`/auth/superadmin/restaurants/${id}/due-date`, {
                dueDate
            });
            if (response.data.success) {
                setRestaurant(response.data.restaurant);
                setPopup({
                    isOpen: true,
                    title: 'Schedule Updated',
                    message: 'The subscription due date has been successfully updated.',
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error updating due date:', error);
            setPopup({
                isOpen: true,
                title: 'Update Failed',
                message: 'Failed to update the due date. Please check your connection.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = async () => {
        const action = restaurant.isActive ? 'deactivate' : 'activate';

        setPopup({
            isOpen: true,
            title: 'Confirm Action',
            message: `Are you sure you want to ${action} ${restaurant.restaurantName}? This will affect their dashboard access immediately.`,
            type: 'confirm',
            confirmText: 'Yes, Proceed',
            onConfirm: async () => {
                // Close the confirmation popup first
                setPopup(prev => ({ ...prev, isOpen: false }));

                try {
                    setIsUpdating(true);
                    const response = await api.patch(`/auth/superadmin/restaurants/${id}/toggle-status`);
                    if (response.data.success) {
                        // Update the restaurant state with the new data from server
                        setRestaurant(response.data.restaurant);

                        // Wait a moment to ensure state update completes
                        setTimeout(() => {
                            setPopup({
                                isOpen: true,
                                title: 'Status Toggled',
                                message: response.data.message,
                                type: 'success',
                                onConfirm: () => {
                                    // Refresh the restaurant details after closing success popup
                                    fetchRestaurantDetails();
                                }
                            });
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error toggling status:', error);
                    setPopup({
                        isOpen: true,
                        title: 'Operation Failed',
                        message: 'Failed to change restaurant status.',
                        type: 'error'
                    });
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    const handleDeleteRestaurant = async () => {
        try {
            setIsUpdating(true);
            const response = await api.delete(`/auth/superadmin/restaurants/${id}`);
            if (response.data.success) {
                setPopup({
                    isOpen: true,
                    title: 'Account Deleted',
                    message: 'The restaurant and all associated data have been permanently removed.',
                    type: 'success',
                    onConfirm: () => navigate('/superadmin/dashboard')
                });
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            setPopup({
                isOpen: true,
                title: 'Deletion Failed',
                message: 'Could not complete the deletion. Please contact technical support.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOverridePassword = async (userId, newPassword) => {
        if (!newPassword || newPassword.length < 4) {
            setPopup({
                isOpen: true,
                title: 'Invalid Password',
                message: 'Password must be at least 4 characters long.',
                type: 'warning'
            });
            return;
        }

        try {
            setIsUpdating(true);
            const response = await api.patch(`/auth/superadmin/restaurants/password/${userId}`, {
                newPassword
            });

            if (response.data.success) {
                // Update local state for owner
                if (restaurant._id === userId) {
                    setRestaurant(prev => ({ ...prev, rawPassword: response.data.rawPassword }));
                }

                // Update local state for staff
                setStaff(prev => prev.map(member =>
                    member._id === userId ? { ...member, portalPassword: response.data.rawPassword } : member
                ));

                setPopup({
                    isOpen: true,
                    title: 'Credential Restored',
                    message: 'The login password has been successfully updated and is now visible in raw format.',
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error overriding password:', error);
            setPopup({
                isOpen: true,
                title: 'Update Failed',
                message: 'Failed to update credentials. Please try again.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };
    const handleUpdatePlan = async () => {
        if (!selectedPlan || !planAmount) {
            setPopup({
                isOpen: true,
                title: 'Required Info',
                message: 'Please select a plan and enter the payment amount.',
                type: 'warning'
            });
            return;
        }

        try {
            setIsUpdating(true);
            const response = await api.patch(`/auth/superadmin/restaurants/${id}/plan`, {
                plan: selectedPlan,
                amount: planAmount
            });

            if (response.data.success) {
                setRestaurant(response.data.restaurant);
                setShowPlanModal(false);
                setPlanAmount(''); // Reset amount
                setPopup({
                    isOpen: true,
                    title: 'Plan Updated',
                    message: `Subscription has been updated to ${selectedPlan}. A payment confirmation email has been sent to the owner.`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            setPopup({
                isOpen: true,
                title: 'Update Failed',
                message: error.response?.data?.message || 'Failed to update plan. Please try again.',
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
                    <p className="text-gray-600 font-medium">Loading restaurant details...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <p className="text-gray-900 font-bold text-xl mb-2">Restaurant not found</p>
                    <button
                        onClick={() => navigate('/superadmin/dashboard')}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/superadmin/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium mb-4 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{restaurant.restaurantName}</h1>
                            <p className="text-gray-500">Detailed Information & Management</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 1. Restaurant Information Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Restaurant Name</p>
                                    <p className="text-lg font-black text-gray-900 truncate">{restaurant.restaurantName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Owner Name</p>
                                    <p className="text-lg font-black text-gray-900">{restaurant.ownerName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                                    <p className="text-lg font-black text-gray-900 truncate">{restaurant.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Onboarded</p>
                                    <p className="text-lg font-black text-gray-900">
                                        {new Date(restaurant.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Subscription & Status Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Plan & Status</h2>
                            <div className={`p-6 rounded-2xl mb-4 ${restaurant.plan === 'Enterprise' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                restaurant.plan === 'Pro' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                    'bg-gradient-to-br from-orange-500 to-red-600'
                                } text-white`}>
                                <p className="text-xs opacity-75 font-bold uppercase tracking-widest">Active Plan</p>
                                <p className="text-3xl font-black">{restaurant.plan}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedPlan(restaurant.plan);
                                    setShowPlanModal(true);
                                }}
                                className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 mb-4"
                            >
                                Change Plan
                            </button>
                        </div>
                        <div className={`p-4 rounded-2xl text-center ${restaurant.isActive ? 'bg-green-50' : 'bg-red-50'} border border-opacity-20`}>
                            <div className="flex items-center justify-center gap-3">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-lg font-black ${restaurant.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                    {restaurant.isActive ? 'Account Active' : 'Account Suspended'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Payment Billing Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-primary">Billing Info</h2>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${restaurant.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {restaurant.paymentStatus}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Due Date</p>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                    <button onClick={handleUpdateDueDate} className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all"><Save className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={() => handleUpdatePaymentStatus('paid')}
                                    disabled={(() => {
                                        if (restaurant?.paymentStatus === 'paid') {
                                            const now = new Date();
                                            const due = new Date(restaurant.dueDate);
                                            if (now <= due) return true;
                                        }
                                        return false;
                                    })()}
                                    title={restaurant?.paymentStatus === 'paid' && new Date() <= new Date(restaurant.dueDate) ? 'Payment already active for this cycle' : ''}
                                    className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${restaurant?.paymentStatus === 'paid' && new Date() <= new Date(restaurant.dueDate)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    Mark Paid
                                </button>
                                <button
                                    onClick={() => handleUpdatePaymentStatus('unpaid')}
                                    disabled={(() => {
                                        if (restaurant?.paymentStatus === 'paid') {
                                            const now = new Date();
                                            const due = new Date(restaurant.dueDate);
                                            if (now <= due) return true;
                                        }
                                        return false;
                                    })()}
                                    title={restaurant?.paymentStatus === 'paid' && new Date() <= new Date(restaurant.dueDate) ? 'Status locked until current cycle ends' : ''}
                                    className={`px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${restaurant?.paymentStatus === 'paid' && new Date() <= new Date(restaurant.dueDate)
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'bg-red-400 text-white hover:bg-red-500'
                                        }`}
                                >
                                    Unpaid
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. Credentials Summary Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Access Credentials</h2>
                        <div className="space-y-6">
                            {/* Owner Row */}
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-orange-500 p-1.5 rounded-lg">
                                        <Store className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Restaurant Owner</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-700">{restaurant.ownerName}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">
                                            {restaurant.rawPassword || (
                                                <span className="text-gray-400 font-bold italic text-[10px]">
                                                    {restaurant.rawPassword === undefined ? 'Field Missing' : 'Hashed Only'}
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const pass = prompt('Enter new password to override:');
                                                if (pass) handleOverridePassword(restaurant._id, pass);
                                            }}
                                            className="p-1 hover:bg-orange-100 rounded-md text-orange-600 transition-all"
                                            title="Override Password"
                                        >
                                            <Key className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Managers Section */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Registered Managers</p>
                                {staff.filter(s => s.role === 'manager').length > 0 ? (
                                    staff.filter(s => s.role === 'manager').map(manager => (
                                        <div key={manager._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">
                                                    {manager.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-700 truncate">{manager.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{manager.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">
                                                    {manager.portalPassword || <span className="text-gray-400 font-bold italic text-[10px]">Hashed</span>}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const pass = prompt(`Enter new password for ${manager.name}:`);
                                                        if (pass) handleOverridePassword(manager._id, pass);
                                                    }}
                                                    className="p-1 hover:bg-orange-100 rounded-md text-orange-600 transition-all border border-orange-100"
                                                >
                                                    <Key className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                        <p className="text-xs text-gray-400 font-bold italic">No Managers registered</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Core Management Actions Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Management</h2>
                        <div className="space-y-3">
                            <button
                                onClick={handleToggleStatus}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${restaurant.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                            >
                                {restaurant.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                                <Power className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-2xl font-black text-sm hover:bg-red-100 transition-all"
                            >
                                Terminate Relationship
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 5. Inventory Summary Card */}
                    <button
                        onClick={() => setShowProductsModal(true)}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-left group hover:border-blue-500 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Package className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Total Products</p>
                    </button>

                    {/* 6. Staff Summary Card */}
                    <button
                        onClick={() => setShowStaffModal(true)}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-left group hover:border-green-500 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                <Users className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{staff.length}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Staff Members</p>
                    </button>

                    {/* 7. Sales Performance Grid - Spans Remaining space */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 font-primary">Revenue Timeline</h2>
                                <p className="text-sm text-gray-500 font-medium">Visualization of last 7 days restaurant activity</p>
                            </div>
                            <div className="px-5 py-2 bg-orange-50 rounded-full">
                                <span className="text-orange-600 font-black text-sm tracking-widest uppercase">Live Analytics</span>
                            </div>
                        </div>

                        <div className="h-[400px] w-full min-w-0">
                            {analytics ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.salesOverTime}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                                            dy={10}
                                            tickFormatter={(str) => {
                                                const date = new Date(str);
                                                return date.toLocaleDateString('en-US', { weekday: 'short' });
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                                            tickFormatter={(value) => `₹${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '20px',
                                                border: 'none',
                                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#f97316"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                    <div className="text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
                                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Streaming Analytics...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 9. Billing History Timeline */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 font-primary">Billing History</h2>
                                <p className="text-sm text-gray-500 font-medium">Record of all previous due dates and payment status changes</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {restaurant.billingHistory && restaurant.billingHistory.length > 0 ? (
                                [...restaurant.billingHistory].reverse().map((log, index) => (
                                    <div key={index} className="flex items-center gap-6 p-5 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                                        <div className="w-1.5 h-12 rounded-full bg-indigo-500/20 flex flex-col items-center justify-center overflow-hidden shrink-0">
                                            <div className="w-full h-1/2 bg-indigo-500 group-hover:h-full transition-all duration-500"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{log.notes}</p>
                                                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                                    {new Date(log.date).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {log.status && (
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${log.status === 'paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        {log.status}
                                                    </span>
                                                )}
                                                {log.dueDate && (
                                                    <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                        Due: {new Date(log.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-auto">
                                                    Recorded by System
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-gray-50/30 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-50">
                                        <History className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-400">No activity recorded</h3>
                                    <p className="text-gray-400 font-medium text-sm">Future status changes will appear here automatically.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 8. Danger Warning - Spans Width */}
                    <div className="lg:col-span-3 bg-red-50 border border-red-100 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                                <AlertCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-red-900 mb-1">Administrative Restriction Notice</h4>
                                <p className="text-red-700 font-medium leading-relaxed">
                                    Any modification to status or billing directly impacts the restaurant's operational capability. Please ensure you have verified the requirements with the restaurant owner before initiating account termination or suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Unified Popup System */}
            <Popup
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
            />

            {/* View Products Modal */}
            {
                showProductsModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Package className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Restaurant Catalog</h3>
                                        <p className="text-gray-500 font-medium">{products.length} items registered by {restaurant.restaurantName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowProductsModal(false)}
                                    className="p-3 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((item) => (
                                        <div key={item._id} className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                            <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${item.isVegetarian ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                        }`}>
                                                        {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1">{item.name}</h4>
                                                <div className="px-3 py-1 bg-orange-50 rounded-xl">
                                                    <span className="font-black text-orange-600">₹{item.price}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">{item.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Package className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">No products yet</h3>
                                            <p className="text-gray-400 font-medium">This restaurant hasn't added any products to their menu.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Staff Directory Modal */}
            {
                showStaffModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
                                        <Users className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Staff Management</h3>
                                        <p className="text-gray-500 font-medium">{staff.length} team members registered</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowStaffModal(false)}
                                    className="p-3 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {staff.map((member) => (
                                        <div key={member._id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-white">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-900 text-lg">{member.name}</h4>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {member.role}
                                                    </span>
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                        {member.shift}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <p className="text-xs font-medium">{member.email}</p>
                                                    </div>
                                                    {member.portalPassword && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded-md bg-red-50">
                                                                <Key className="w-3 h-3 text-red-500" />
                                                            </div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pass:</div>
                                                            <span className="text-sm font-black text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">
                                                                {member.portalPassword || <span className="text-gray-400 font-bold italic text-[8px]">Hashed</span>}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {staff.length === 0 && (
                                        <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">No staff members</h3>
                                            <p className="text-gray-400 font-medium">This restaurant hasn't registered any staff members yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Change Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900">Update Subscription</h3>
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Tier</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['Starter', 'Pro', 'Enterprise'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedPlan(p)}
                                            className={`w-full p-4 rounded-2xl border-2 transition-all text-left group ${selectedPlan === p
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-100 hover:border-orange-200 bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-black ${selectedPlan === p ? 'text-orange-600' : 'text-gray-900'}`}>{p}</span>
                                                {selectedPlan === p && <CheckCircle className="w-5 h-5 text-orange-500" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payment Amount (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                    <input
                                        type="number"
                                        placeholder="Enter received amount"
                                        value={planAmount}
                                        onChange={(e) => setPlanAmount(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-8 pr-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdatePlan}
                                disabled={isUpdating}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Confirm & Send Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetailsPage;
