const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-float" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20" style={{ animationDelay: '1s' }} />

            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="animate-fadeInUp">
                        <span className="badge">🚀 No App Required</span>
                        <h1 className="mb-6">
                            Scan. View Menu. <span className="text-gradient">Order Smarter.</span>
                        </h1>
                        <p className="text-xl mb-8 text-gray-600">
                            Let customers scan a QR code and instantly access your live restaurant menu—no app required.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="btn btn-primary">
                                Get Started Free
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button className="btn btn-secondary">
                                Request Demo
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12">
                            <div>
                                <h3 className="text-3xl font-bold text-gradient">500+</h3>
                                <p className="text-gray-600">Restaurants</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gradient">50K+</h3>
                                <p className="text-gray-600">Daily Scans</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gradient">4.9/5</h3>
                                <p className="text-gray-600">Rating</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Phone Mockup */}
                    <div className="relative animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="relative z-10">
                            {/* Phone Frame */}
                            <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                                    {/* Screen Content */}
                                    <div className="h-full bg-gradient-to-b from-orange-50 to-white p-6">
                                        {/* Header */}
                                        <div className="text-center mb-6">
                                            <h4 className="text-2xl font-bold text-gray-800">Delicious Bites</h4>
                                            <p className="text-sm text-gray-600">Indian Cuisine</p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="space-y-4">
                                            {[
                                                { name: 'Butter Chicken', price: '$12.99', emoji: '🍗' },
                                                { name: 'Paneer Tikka', price: '$9.99', emoji: '🧀' },
                                                { name: 'Biryani Special', price: '$14.99', emoji: '🍛' },
                                            ].map((item, idx) => (
                                                <div key={idx} className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-green-400 flex items-center justify-center text-2xl">
                                                        {item.emoji}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                                        <p className="text-orange-600 font-bold">{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
                            </div>

                            {/* QR Code */}
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 animate-float">
                                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zM15 15h2v2h-2v-2zM13 17h2v2h-2v-2zM15 19h2v2h-2v-2zM17 13h2v2h-2v-2zM19 15h2v2h-2v-2zM17 17h2v2h-2v-2zM19 19h2v2h-2v-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
