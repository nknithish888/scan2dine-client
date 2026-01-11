const Features = () => {
    const features = [
        {
            title: 'QR Code Menu',
            description: 'No app needed - customers scan and view instantly',
            icon: '📱',
            gradient: 'from-orange-400 to-orange-600',
        },
        {
            title: 'Real-Time Updates',
            description: 'Update menu prices and items anytime, instantly',
            icon: '⚡',
            gradient: 'from-green-400 to-green-600',
        },
        {
            title: 'Category-Based',
            description: 'Organize dishes by appetizers, mains, desserts',
            icon: '📂',
            gradient: 'from-orange-500 to-pink-500',
        },
        {
            title: 'Mobile Optimized',
            description: 'Perfect viewing experience on any device',
            icon: '📲',
            gradient: 'from-blue-400 to-blue-600',
        },
        {
            title: 'Multi-Restaurant',
            description: 'Manage multiple restaurants from one dashboard',
            icon: '🏪',
            gradient: 'from-purple-400 to-purple-600',
        },
        {
            title: 'Affordable Setup',
            description: 'Start free, upgrade as you grow',
            icon: '💰',
            gradient: 'from-green-500 to-teal-500',
        },
    ];

    return (
        <section id="features" className="section">
            <div className="container">
                <h2 className="section-title">Powerful Features</h2>
                <p className="section-subtitle">
                    Everything you need to modernize your restaurant menu experience
                </p>

                <div className="grid grid-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="card group"
                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h4 className="mb-2">{feature.title}</h4>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
