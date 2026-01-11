const Testimonials = () => {
    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Owner, Bella Italia',
            image: '👩‍🍳',
            rating: 5,
            text: 'Scan2Dine transformed our restaurant! No more printing costs, and customers love the convenience. Our service is faster and more efficient.',
        },
        {
            name: 'Michael Chen',
            role: 'Manager, Spice Route',
            image: '👨‍💼',
            rating: 5,
            text: 'The dashboard is so easy to use. I can update prices in seconds during happy hour. Our customers appreciate the contactless experience.',
        },
        {
            name: 'Priya Sharma',
            role: 'Owner, Café Delight',
            image: '👩‍💻',
            rating: 5,
            text: 'Started with the free plan and upgraded within a week! The analytics help us understand what dishes are popular. Highly recommended!',
        },
    ];

    return (
        <section className="section">
            <div className="container">
                <h2 className="section-title">Loved by Restaurant Owners</h2>
                <p className="section-subtitle">
                    Join hundreds of satisfied restaurants using Scan2Dine
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="card"
                            style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-3 mt-auto">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-3xl">
                                    {testimonial.image}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
