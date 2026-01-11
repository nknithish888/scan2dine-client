const Benefits = () => {
    const benefits = [
        {
            title: 'Zero Printing Costs',
            description: 'Say goodbye to expensive menu reprints. Update digitally anytime.',
            icon: '💸',
        },
        {
            title: 'Lightning Fast Service',
            description: 'Customers browse menus instantly while waiting to order.',
            icon: '⚡',
        },
        {
            title: 'Hygienic & Contactless',
            description: 'Safe, touchless experience preferred by modern diners.',
            icon: '✨',
        },
        {
            title: 'Update Anytime',
            description: 'Sold out? Price change? Update in seconds from anywhere.',
            icon: '🔄',
        },
    ];

    return (
        <section className="section section-gray">
            <div className="container">
                <h2 className="section-title">Why Restaurants Love Us</h2>
                <p className="section-subtitle">
                    Save time, money, and deliver a better dining experience
                </p>

                <div className="grid grid-2">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="flex gap-6 items-start p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                        >
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-3xl flex-shrink-0">
                                {benefit.icon}
                            </div>
                            <div>
                                <h4 className="mb-2">{benefit.title}</h4>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
