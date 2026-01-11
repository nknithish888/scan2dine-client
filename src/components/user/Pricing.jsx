import { useState } from 'react';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: 'Starter',
            price: billingCycle === 'monthly' ? '0' : '0',
            period: 'Forever Free',
            description: 'Perfect for small cafés getting started',
            features: [
                '1 Restaurant',
                'Up to 50 dishes',
                'Basic QR code',
                'Mobile optimized menu',
                'Email support',
            ],
            popular: false,
            cta: 'Start Free',
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '29' : '290',
            period: billingCycle === 'monthly' ? 'per month' : 'per year',
            description: 'Best for growing restaurants',
            features: [
                'Up to 5 Restaurants',
                'Unlimited dishes',
                'Custom branded QR',
                'Advanced analytics',
                'Priority support',
                'Menu customization',
            ],
            popular: true,
            cta: 'Start Free Trial',
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'Contact Us',
            description: 'For large chains and franchises',
            features: [
                'Unlimited restaurants',
                'White-label solution',
                'API access',
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
            ],
            popular: false,
            cta: 'Contact Sales',
        },
    ];

    return (
        <section id="pricing" className="section section-gray">
            <div className="container">
                <h2 className="section-title">Simple, Transparent Pricing</h2>
                <p className="section-subtitle">
                    Choose the plan that fits your restaurant's needs
                </p>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white rounded-full p-1 shadow-md inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === 'monthly'
                                    ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                                    : 'text-gray-600'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === 'yearly'
                                    ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                                    : 'text-gray-600'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''
                                }`}
                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg z-10">
                                    Most Popular
                                </div>
                            )}

                            <div className={`card h-full ${plan.popular ? 'border-2 border-orange-500' : ''}`}>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>

                                <div className="mb-6">
                                    <div className="flex items-baseline mb-2">
                                        {plan.price === 'Custom' ? (
                                            <span className="text-4xl font-bold text-gradient">Custom</span>
                                        ) : (
                                            <>
                                                <span className="text-5xl font-bold text-gradient">${plan.price}</span>
                                                <span className="text-gray-600 ml-2">/{plan.period}</span>
                                            </>
                                        )}
                                    </div>
                                    {plan.price !== 'Custom' && (
                                        <p className="text-sm text-gray-500">{plan.period}</p>
                                    )}
                                </div>

                                <button className={`w-full mb-6 ${plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}`}>
                                    {plan.cta}
                                </button>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
