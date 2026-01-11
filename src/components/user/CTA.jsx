const CTA = () => {
    return (
        <section className="section relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-green-500 opacity-5" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20 animate-float" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-20" style={{ animationDelay: '1.5s' }} />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white rounded-3xl p-12 shadow-2xl">
                        <span className="badge mb-4">Ready to Get Started?</span>
                        <h2 className="mb-6">Upgrade Your Restaurant Menu Today</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join hundreds of restaurants serving their menus the modern way. Start free, no credit card required.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <button className="btn btn-primary text-lg">
                                Create My QR Menu
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button className="btn btn-secondary text-lg">
                                Schedule Demo
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                            <div>
                                <p className="text-3xl font-bold text-gradient">500+</p>
                                <p className="text-gray-600 text-sm">Happy Restaurants</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gradient">50K+</p>
                                <p className="text-gray-600 text-sm">Daily Scans</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gradient">4.9/5</p>
                                <p className="text-gray-600 text-sm">Customer Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
