const HowItWorks = () => {
    const steps = [
        {
            number: '1',
            title: 'Upload Your Menu',
            description: 'Add dishes, prices, and mouth-watering images to your digital menu',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
        },
        {
            number: '2',
            title: 'Get Your QR Code',
            description: 'Unique QR code is instantly generated for your restaurant',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4z" />
                </svg>
            ),
        },
        {
            number: '3',
            title: 'Customers Scan & Order',
            description: 'Diners scan and view your menu instantly on their phones',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    return (
        <section id="how-it-works" className="section section-gray">
            <div className="container">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                    Get your digital menu up and running in minutes—it's incredibly simple!
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative"
                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-orange-400 to-green-400 opacity-30 z-0" />
                            )}

                            <div className="card text-center relative z-10">
                                {/* Step Number */}
                                <div className="absolute -top-4 left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="card-icon mx-auto">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h4 className="mb-3">{step.title}</h4>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
