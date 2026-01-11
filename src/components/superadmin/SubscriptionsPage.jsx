import React from 'react';
import { DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const SubscriptionsPage = () => {
    return (
        <div className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Monthly Revenue', value: '$12,450', change: '+12.5%', isUp: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Annual Revenue', value: '$148,000', change: '+8.2%', isUp: true, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Churn Rate', value: '1.2%', change: '-0.4%', isUp: true, icon: ArrowDownRight, color: 'text-orange-600', bg: 'bg-orange-100' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Subscription Tiers</h3>
                    <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-200 transition-all">Manage Plans</button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Starter', price: '29', features: ['Up to 50 items', 'Basic QR', 'Email support'], color: 'from-gray-400 to-gray-500' },
                        { name: 'Pro', price: '79', features: ['Unlimited items', 'Custom Branding', 'Priority support'], color: 'from-orange-500 to-orange-600', popular: true },
                        { name: 'Enterprise', price: '199', features: ['Multi-restaurant', 'API Access', 'Account Manager'], color: 'from-purple-500 to-purple-600' }
                    ].map((plan, i) => (
                        <div key={i} className={`relative p-8 rounded-3xl border-2 ${plan.popular ? 'border-orange-500 shadow-xl' : 'border-gray-100 shadow-sm'} flex flex-col`}>
                            {plan.popular && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</span>
                            )}
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h4>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                                <span className="text-gray-400 font-bold">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-800 hover:bg-gray-900'}`}>Edit {plan.name} Plan</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
