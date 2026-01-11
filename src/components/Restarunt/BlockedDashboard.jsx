import React from 'react';
import { AlertCircle, CreditCard, Mail, Phone, ExternalLink } from 'lucide-react';

const BlockedDashboard = ({ message, isOverdue, isInactive }) => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl border-2 border-red-50 overflow-hidden animate-scaleIn">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <AlertCircle className="w-64 h-64 -ml-12 -mt-12 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/10">
                            <CreditCard className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Access Restricted</h2>
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 inline-block">
                            <p className="text-red-50 font-bold uppercase tracking-[0.2em] text-xs">
                                Account Security & Billing Notice
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-12 text-center">
                    <p className="text-2xl font-black text-gray-900 mb-6 leading-tight">
                        {message || "Please pay the due amount to access the functions"}
                    </p>

                    <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                        To protect your business data and maintain our high-performance infrastructure, access is temporarily limited due to pending subscription requirements.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-orange-200 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-orange-500" />
                            </div>
                            <h4 className="font-black text-gray-900 text-sm mb-1 uppercase tracking-wider">Call Support</h4>
                            <p className="text-gray-500 font-bold text-xs">+91 95055 35249</p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-blue-200 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-blue-500" />
                            </div>
                            <h4 className="font-black text-gray-900 text-sm mb-1 uppercase tracking-wider">Email Billing</h4>
                            <p className="text-gray-500 font-bold text-xs italic">contact@genzithub.com</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            Refresh Status
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                        Powered by Gen-Z ITHUB Billing System v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlockedDashboard;
