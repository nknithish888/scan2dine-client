import React, { useState, useEffect } from 'react';
import api from '../config/api';
import {
    LayoutDashboard,
    UtensilsCrossed,
    ClipboardList,
    Users,
    Settings as SettingsIcon,
    LogOut,
    Bell,
    Search,
    Store,
    QrCode,
    FileText,
    TrendingDown,
    Menu,
    X,
    Receipt,
    BarChart3,
    MessageSquare,
    Mail
} from 'lucide-react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import RestaurantDashboardPage from './RestaurantDashboardPage';
import MenuManagement from './MenuManagement';
import LiveOrders from './LiveOrders';
import OrderHistory from './OrderHistory';
import QRGenerator from './QRGenerator';
import StaffManagement from './StaffManagement';
import ExpenseManagement from './ExpenseManagement';
import Billing from './Billing';
import BlockedDashboard from './BlockedDashboard';
import Reports from './Reports';
import RestaurantFeedback from './RestaurantFeedback';
import NewsletterManagement from './NewsletterManagement';
import Settings from './Settings';

const RestaurantDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [blockedInfo, setBlockedInfo] = useState(null);

    useEffect(() => {
        checkAccountStatus();
    }, []);

    const checkAccountStatus = async () => {
        try {
            await api.get('/orders/stats');
        } catch (err) {
            if (err.response?.status === 403 && (err.response.data.isOverdue || err.response.data.isInactive)) {
                setBlockedInfo({
                    message: err.response.data.message,
                    isOverdue: err.response.data.isOverdue,
                    isInactive: err.response.data.isInactive
                });
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const menuItems = user.role === 'manager'
        ? [
            { icon: ClipboardList, label: 'Live Orders', path: '/restaurant/dashboard/live-orders' },
            { icon: FileText, label: 'Order History', path: '/restaurant/dashboard/order-history' },
            { icon: Receipt, label: 'Billing', path: '/restaurant/dashboard/billing' },
            { icon: TrendingDown, label: 'Expenses', path: '/restaurant/dashboard/expenses' },
            { icon: BarChart3, label: 'Reports', path: '/restaurant/dashboard/reports' },
        ]
        : [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard/dashboard' },
            { icon: UtensilsCrossed, label: 'Menu Management', path: '/restaurant/dashboard/menu' },
            { icon: ClipboardList, label: 'Live Orders', path: '/restaurant/dashboard/live-orders' },
            { icon: FileText, label: 'Order History', path: '/restaurant/dashboard/order-history' },
            { icon: Receipt, label: 'Billing', path: '/restaurant/dashboard/billing' },
            { icon: TrendingDown, label: 'Expenses', path: '/restaurant/dashboard/expenses' },
            { icon: BarChart3, label: 'Reports', path: '/restaurant/dashboard/reports' },
            { icon: QrCode, label: 'QR Generator', path: '/restaurant/dashboard/qr' },
            { icon: MessageSquare, label: 'Feedback', path: '/restaurant/dashboard/feedback' },
            { icon: Mail, label: 'Newsletter', path: '/restaurant/dashboard/newsletter' },
            { icon: Users, label: 'Staff', path: '/restaurant/dashboard/staff' },
            { icon: SettingsIcon, label: 'Settings', path: '/restaurant/dashboard/settings' },
        ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm 
                transform transition-transform duration-300 lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Store className="text-white w-6 h-6" />
                        </div>
                        <div className="ml-3">
                            <span className="block font-bold text-lg text-gray-800">Scan2Dine</span>
                            <span className="block text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                                {user.role === 'manager' ? 'Manager Panel' : 'Restaurant Panel'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                                w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    : 'text-gray-500 hover:bg-gray-50'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-3 font-semibold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3 font-semibold">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate max-w-[150px] md:max-w-none">
                                {user.restaurantName || 'Restaurant Dashboard'}
                            </h2>
                            <p className="text-[10px] md:text-sm text-gray-500">Welcome, {user.ownerName || 'Owner'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        <div className="relative hidden xl:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <Search className="w-4 h-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                                placeholder="Search orders..."
                            />
                        </div>

                        <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                            <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 md:pl-6 md:border-l border-gray-100">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm md:text-base font-bold shadow-md">
                                {user.ownerName ? user.ownerName.charAt(0) : 'R'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    <div className="max-w-full lg:max-w-7xl mx-auto">
                        {blockedInfo ? (
                            <BlockedDashboard {...blockedInfo} />
                        ) : (
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<RestaurantDashboardPage user={user} />} />
                                <Route path="menu" element={<MenuManagement />} />
                                <Route path="live-orders" element={<LiveOrders />} />
                                <Route path="order-history" element={<OrderHistory />} />
                                <Route path="qr" element={<QRGenerator />} />
                                <Route path="staff" element={<StaffManagement />} />
                                <Route path="expenses" element={<ExpenseManagement />} />
                                <Route path="billing" element={<Billing />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="feedback" element={<RestaurantFeedback />} />
                                <Route path="newsletter" element={<NewsletterManagement />} />
                                <Route path="settings" element={<Settings />} />
                            </Routes>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
