import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageSquare,
    User,
    Calendar,
    Loader2,
    Trophy,
    TrendingUp,
    Users,
    MessageCircle
} from 'lucide-react';
import api from '../config/api';

const RestaurantFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalFeedback: 0,
        positivePercentage: 0
    });

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await api.get('/feedback/all');
            if (res.data.success) {
                const data = res.data.data;
                setFeedback(data);

                // Calculate stats
                if (data.length > 0) {
                    const avg = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
                    const positive = data.filter(item => item.rating >= 4).length;
                    setStats({
                        averageRating: avg.toFixed(1),
                        totalFeedback: data.length,
                        positivePercentage: Math.round((positive / data.length) * 100)
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn space-y-10 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Customer Reviews</h2>
                <p className="text-gray-500 font-medium">Listen to what your diners have to say</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider opacity-80">Avg Rating</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{stats.averageRating}</p>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= Math.round(stats.averageRating) ? 'fill-white text-white' : 'text-white/30'}`} />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-400">Total Reviews</span>
                    </div>
                    <p className="text-4xl font-black mb-1 text-gray-900">{stats.totalFeedback}</p>
                    <p className="text-sm font-bold text-blue-600">All-time feedback</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-400">Satisfaction</span>
                    </div>
                    <p className="text-4xl font-black mb-1 text-gray-900">{stats.positivePercentage}%</p>
                    <p className="text-sm font-bold text-green-600">Positive sentiment</p>
                </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-6">
                {feedback.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No feedback yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Generated your feedback QR code to start receiving customer reviews!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {feedback.map((item) => (
                            <div key={item._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900">{item.customerName}</h4>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <Star key={i} className={`w-3 h-3 ${i <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {item.rating >= 4 && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
                                            <Trophy className="w-3 h-3" /> Recommended
                                        </div>
                                    )}
                                </div>
                                {item.comment && (
                                    <p className="mt-4 text-gray-600 font-medium leading-relaxed pl-16">
                                        "{item.comment}"
                                    </p>
                                )}

                                {/* Customer Images */}
                                {item.images && item.images.length > 0 && (
                                    <div className="mt-6 pl-16 flex flex-wrap gap-3">
                                        {item.images.map((img, idx) => (
                                            <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:scale-110 transition-transform duration-300">
                                                <img
                                                    src={`${api.defaults.baseURL.replace('/api', '')}${img}`}
                                                    alt={`Customer review photo ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantFeedback;
