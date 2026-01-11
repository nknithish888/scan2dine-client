import React from 'react';
import { Settings, Shield, Bell, Globe, Database, Save } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="animate-fadeIn max-w-4xl">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Platform Settings</h3>
                    <p className="text-gray-500 text-sm">Manage global configurations for the Scan2Dine ecosystem.</p>
                </div>

                <div className="p-8 space-y-10">
                    {/* General Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-orange-500" />
                                General Info
                            </h4>
                            <p className="text-xs text-gray-400">Basic platform information shown to users.</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Name</label>
                                <input type="text" defaultValue="Scan2Dine" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Support Email</label>
                                <input type="email" defaultValue="support@scan2dine.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* Security Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                Security
                            </h4>
                            <p className="text-xs text-gray-400">Admin access & data protection rules.</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-400">Add an extra layer of security to admin login.</p>
                                </div>
                                <div className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer shadow-inner">
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">Session Timeout</p>
                                    <p className="text-xs text-gray-400">Automatically logout after 24 hours.</p>
                                </div>
                                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    <div className="flex justify-end pt-4">
                        <button className="flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-700 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all">
                            <Save className="w-5 h-5" />
                            Save Configurations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
