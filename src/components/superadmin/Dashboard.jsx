import React, { useState } from 'react';
import {
    Users,
    Store,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    Bell,
    Search,
    Clock,
    PlusCircle
} from 'lucide-react';
import AddRestaurantOwner from './AddRestaurantOwner';
import DashboardPage from './DashboardPage';
import RestaurantsPage from './RestaurantsPage';
import CustomersPage from './CustomersPage';
import SubscriptionsPage from './SubscriptionsPage';
import SettingsPage from './SettingsPage';

const SuperAdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Dashboard');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <DashboardPage onAddClick={() => setIsAddModalOpen(true)} />;
            case 'Restaurants':
                return <RestaurantsPage onAddClick={() => setIsAddModalOpen(true)} />;
            case 'Customers':
                return <CustomersPage />;
            case 'Subscriptions':
                return <SubscriptionsPage />;
            case 'Settings':
                return <SettingsPage />;
            default:
                return <DashboardPage onAddClick={() => setIsAddModalOpen(true)} />;
        }
    };

    const menuItems = [
        { icon: BarChart3, label: 'Dashboard' },
        { icon: Store, label: 'Restaurants' },
        { icon: Users, label: 'Customers' },
        { icon: DollarSign, label: 'Subscriptions' },
        { icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Add Modal */}
            {isAddModalOpen && (
                <AddRestaurantOwner
                    onClose={() => setIsAddModalOpen(false)}
                    onOwnerAdded={() => {
                        window.location.reload();
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-gray-100 transition-all duration-500 flex flex-col z-20 shadow-xl shadow-gray-200/50`}>
                <div className="h-24 flex items-center px-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                        <Store className="text-white w-6 h-6" />
                    </div>
                    {sidebarOpen && (
                        <div className="ml-4 animate-fadeInRight">
                            <span className="block font-black text-2xl bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">Scan2Dine</span>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Super Admin</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-8 px-4 space-y-3">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.label
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 translate-x-1'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.label ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {sidebarOpen && <span className="ml-4 font-bold tracking-wide">{item.label}</span>}
                            {activeTab === item.label && sidebarOpen && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {sidebarOpen && <span className="ml-4 font-bold">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 z-10 sticky top-0">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="animate-fadeIn">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{activeTab}</h2>
                            <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative hidden xl:block animate-fadeIn">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
                                <Search className="w-4 h-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-80 pl-11 pr-4 py-3 border-none bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-sm text-gray-600"
                                placeholder={`Search in ${activeTab.toLowerCase()}...`}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                                <Bell className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-orange-600 rounded-full border-2 border-white animate-pulse"></span>
                            </button>

                            <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-gray-900">Admin</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active session</p>
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-[1px] shadow-lg shadow-orange-500/10 transform hover:scale-105 transition-all cursor-pointer">
                                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                                        SA
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-10 bg-gray-50/30">
                    <div className="max-w-7xl mx-auto">
                        {renderActiveComponent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
