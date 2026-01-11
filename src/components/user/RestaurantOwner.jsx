const RestaurantOwner = () => {
    return (
        <section className="section">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left - Dashboard Preview */}
                    <div className="order-2 md:order-1 animate-fadeInUp">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-2xl">
                            {/* Dashboard Header */}
                            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
                                <h4 className="text-xl font-bold mb-4">Restaurant Dashboard</h4>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium text-sm">
                                        + Add Dish
                                    </button>
                                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm">
                                        Categories
                                    </button>
                                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm">
                                        Settings
                                    </button>
                                </div>
                            </div>

                            {/* Sample Dishes */}
                            <div className="space-y-4">
                                {[
                                    { name: 'Margherita Pizza', price: '$12.99', status: 'Available' },
                                    { name: 'Caesar Salad', price: '$8.99', status: 'Available' },
                                    { name: 'Chocolate Lava Cake', price: '$6.99', status: 'Currently Unavailable' },
                                ].map((dish, idx) => (
                                    <div key={idx} className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{dish.name}</p>
                                                <p className="text-sm text-gray-600">{dish.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${dish.status === 'Available'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {dish.status}
                                            </span>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right - Content */}
                    <div className="order-1 md:order-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <span className="badge">For Restaurant Owners</span>
                        <h2 className="mb-6">Simple Dashboard to Manage Everything</h2>
                        <p className="text-xl mb-6 text-gray-600">
                            Add, edit, and organize your menu with our intuitive dashboard. No technical skills needed.
                        </p>

                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Add Dishes in Seconds',
                                    description: 'Upload food images, set prices, add descriptions',
                                    icon: '🍽️',
                                },
                                {
                                    title: 'Instant Menu Updates',
                                    description: 'Changes go live immediately after saving',
                                    icon: '⚡',
                                },
                                {
                                    title: 'Organize by Categories',
                                    description: 'Group items into starters, mains, desserts, drinks',
                                    icon: '📋',
                                },
                                {
                                    title: 'Track Performance',
                                    description: 'See which dishes are most viewed and popular',
                                    icon: '📊',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-2xl flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RestaurantOwner;
