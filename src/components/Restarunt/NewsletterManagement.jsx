import React, { useState, useEffect } from 'react';
import {
    Mail,
    Send,
    Users,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Type,
    AlignLeft,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import api from '../config/api';

const NewsletterManagement = () => {
    const [emails, setEmails] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const res = await api.get('/feedback/emails');
            if (res.data.success) {
                setEmails(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!subject || !content || emails.length === 0) return;

        setIsSending(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await api.post('/feedback/newsletter/send', {
                subject,
                content
            });

            if (res.data.success) {
                setStatus({ type: 'success', message: res.data.message });
                setSubject('');
                setContent('');
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send newsletter. Please try again.'
            });
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Customer Newsletter</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        Send personalized updates to your {emails.length} subscribers
                    </p>
                </div>
                <div className="px-6 py-3 bg-orange-50 rounded-2xl border border-orange-100">
                    <span className="text-orange-600 font-black text-sm uppercase tracking-wider">
                        Collected Emails: {emails.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <form onSubmit={handleSend} className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Type className="w-3 h-3" /> Email Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter subject (e.g., Happy New Year Special Menu!)"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/30 outline-none transition-all font-bold text-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <AlignLeft className="w-3 h-3" /> Message Content
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows="12"
                                    placeholder="Write your beautiful message here... Use \n for new lines."
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/30 outline-none transition-all font-medium text-gray-700 resize-none leading-relaxed"
                                    required
                                ></textarea>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span className="font-bold">{status.message}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSending || emails.length === 0}
                                className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                            >
                                {isSending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-6 h-6" />
                                        Send to Broadcast List
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar/Info Section */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-orange-500" /> Preview
                        </h3>
                        <div className="space-y-4 opacity-50 grayscale select-none">
                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                            <div className="space-y-2 py-4">
                                <div className="h-2 bg-gray-50 rounded-full"></div>
                                <div className="h-2 bg-gray-50 rounded-full"></div>
                                <div className="h-2 bg-gray-50 rounded-full w-5/6"></div>
                            </div>
                            <div className="h-10 bg-orange-100 rounded-full w-full"></div>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 font-medium text-center italic">
                            Email will be sent with your restaurant branding and a direct ordering link automatically.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-xl font-black mb-4">Engagement Tip</h3>
                        <p className="opacity-90 font-medium leading-relaxed mb-6">
                            Add news about special weekend dishes or limited-time combos to drive 40% more orders!
                        </p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-black transition-all flex items-center justify-center gap-2">
                            View Campaign Ideas <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterManagement;
