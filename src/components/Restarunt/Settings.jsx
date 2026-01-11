import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Shield,
    Power,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Store,
    Mail,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import api from '../config/api';

const Settings = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (currentUser.role === 'restaurant_owner') {
            fetchManagers();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchManagers = async () => {
        try {
            const res = await api.get('/staff/managers');
            if (res.data.success) {
                setManagers(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching managers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleManager = async (id) => {
        setIsUpdating(id);
        setStatus({ type: '', message: '' });
        try {
            const res = await api.patch(`/staff/managers/${id}/toggle-status`);
            if (res.data.success) {
                setManagers(managers.map(m => m._id === id ? res.data.data : m));
                setStatus({ type: 'success', message: res.data.message });
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update manager status'
            });
        } finally {
            setIsUpdating(null);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100">
                    <SettingsIcon className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your restaurant credentials and portal access</p>
                </div>
            </div>

            {/* Restaurant Info Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                    <Store className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">Restaurant Information</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border border-gray-100 flex items-center gap-3">
                            <Store className="w-4 h-4 text-gray-400" />
                            {currentUser.restaurantName}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Owner Email</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border border-gray-100 flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {currentUser.email}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                        <div className="px-6 py-4 bg-gray-50 rounded-2xl font-black text-orange-600 border border-orange-100 flex items-center gap-3 uppercase">
                            <Shield className="w-4 h-4" />
                            {currentUser.role.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manager Management (Only for Owners) */}
            {currentUser.role === 'restaurant_owner' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">Portal Managers</h3>
                        </div>
                        <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black">
                            {managers.length} ACCOUNTS
                        </span>
                    </div>

                    <div className="p-8">
                        {managers.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 font-bold">No managers found. Add them in Staff Management.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {managers.map((manager) => (
                                    <div key={manager._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-orange-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${manager.isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                                                }`}>
                                                {manager.ownerName?.charAt(0) || 'M'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800">{manager.ownerName}</h4>
                                                <p className="text-sm text-gray-500 font-medium">{manager.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <div className={`text-xs font-black uppercase tracking-widest ${manager.isActive ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                    {manager.isActive ? 'Access Granted' : 'Access Revoked'}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                    Current Status
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleManager(manager._id)}
                                                disabled={isUpdating === manager._id}
                                                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 shadow-inner ${manager.isActive ? 'bg-orange-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform flex items-center justify-center ${manager.isActive ? 'translate-x-6' : 'translate-x-0'
                                                    }`}>
                                                    {isUpdating === manager._id ? (
                                                        <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                                                    ) : (
                                                        <Power className={`w-3 h-3 ${manager.isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {status.message && (
                <div className={`fixed bottom-10 right-10 p-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4 duration-300 border backdrop-blur-md ${status.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-700' : 'bg-red-50/90 border-red-200 text-red-700'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    <span className="font-bold text-lg">{status.message}</span>
                </div>
            )}
        </div>
    );
};

export default Settings;
