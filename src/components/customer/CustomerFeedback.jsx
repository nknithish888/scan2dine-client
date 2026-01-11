import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Star,
    Send,
    MessageSquare,
    User,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Heart,
    Plus,
    X,
    Mail
} from 'lucide-react';
import api from '../config/api';

const CustomerFeedback = () => {
    const { restaurantSlug } = useParams();
    const navigate = useNavigate();
    const [restaurantInfo, setRestaurantInfo] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await api.get(`/feedback/info/${restaurantSlug}`);
                if (res.data.success) {
                    setRestaurantInfo(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching restaurant info:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInfo();
    }, [restaurantSlug]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }

        const newImages = [...selectedImages, ...files];
        setSelectedImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('restaurantSlug', restaurantSlug);
            formData.append('rating', rating);
            formData.append('comment', comment);
            formData.append('customerName', customerName);
            formData.append('customerEmail', customerEmail);
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            await api.post('/feedback/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsSuccess(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Thank You!</h2>
                <p className="text-gray-500 text-lg mb-10 max-w-sm">
                    Your feedback means a lot to us. We hope to see you again soon at {restaurantInfo?.restaurantName}!
                </p>
                <button
                    onClick={() => navigate(`/${restaurantSlug}`)}
                    className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-200 hover:-translate-y-1 transition-all"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 sm:p-6">
            <div className="max-w-xl mx-auto pt-10 pb-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <MessageSquare className="w-10 h-10 text-orange-500 -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Share Your Experience</h1>
                    <p className="text-gray-500 font-medium">How was your time at {restaurantInfo?.restaurantName}?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rating Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-100/50 text-center">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Overall Rating</p>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-all ${star <= (hover || rating)
                                            ? 'fill-yellow-400 text-yellow-400 stroke-[1.5]'
                                            : 'text-gray-200 stroke-[1.5]'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 font-black">
                            {rating === 1 && 'Needs Improvement 😕'}
                            {rating === 2 && 'It was okay 😐'}
                            {rating === 3 && 'Good experience 🙂'}
                            {rating === 4 && 'Very good! 😋'}
                            {rating === 5 && 'Absolutely amazing! ✨'}
                        </p>
                    </div>

                    {/* Comment Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-100/50">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-600 uppercase tracking-wider">
                                    <User className="w-4 h-4" /> Your Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/30 outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-600 uppercase tracking-wider">
                                    <Mail className="w-4 h-4" /> Your Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="e.g. rahul@example.com"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/30 outline-none transition-all font-bold"
                                />
                                <p className="text-[10px] text-gray-400 font-bold ml-1">We'll send you a thank you note and recommendations!</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-600 uppercase tracking-wider">
                                    <MessageSquare className="w-4 h-4" /> Your Thoughts
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    placeholder="Tell us what you liked or what we can improve..."
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/30 outline-none transition-all font-bold resize-none"
                                ></textarea>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-600 uppercase tracking-wider">
                                    <Star className="w-4 h-4" /> Add Photos (Optional)
                                </label>

                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-gray-100">
                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {imagePreviews.length < 5 && (
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-orange-500/50 hover:bg-orange-50/30 transition-all group">
                                            <Plus className="w-6 h-6 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-orange-600">Add Photo</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold">Max 5 photos allowed. JPEG, PNG or WebP.</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={rating === 0 || isSubmitting}
                        className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${rating > 0
                            ? 'bg-orange-500 text-white shadow-orange-200 hover:-translate-y-1 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-6 h-6" /> Submit Feedback
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/${restaurantSlug}`)}
                        className="w-full py-4 text-gray-400 font-bold flex items-center justify-center gap-2 hover:text-orange-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Menu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerFeedback;
