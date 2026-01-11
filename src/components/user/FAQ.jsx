import { useState } from 'react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: 'Do customers need to install an app?',
            answer: 'No! Customers simply scan the QR code with their phone camera, and the menu opens instantly in their browser. No downloads or installations required.',
        },
        {
            question: 'Can I update my menu anytime?',
            answer: 'Absolutely! You can update prices, add new dishes, or remove items 24/7 from your dashboard. Changes go live immediately.',
        },
        {
            question: 'Is it mobile-friendly?',
            answer: 'Yes! Our menus are fully optimized for all devices—smartphones, tablets, and desktops. They look beautiful on any screen size.',
        },
        {
            question: 'How do I get my QR code?',
            answer: 'Once you create your menu, we generate a unique QR code for your restaurant. You can download it and print it on table tents, posters, or anywhere you like.',
        },
        {
            question: 'Can I manage multiple restaurants?',
            answer: 'Yes! Our Pro and Enterprise plans support multiple restaurant locations, all manageable from a single dashboard.',
        },
        {
            question: 'What if I need help?',
            answer: 'We offer email support for free users and priority support for paid plans. Enterprise customers get a dedicated account manager.',
        },
    ];

    return (
        <section id="faq" className="section section-gray">
            <div className="container">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <p className="section-subtitle">
                    Everything you need to know about Scan2Dine
                </p>

                <div className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="mb-4 animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full bg-white rounded-xl p-6 text-left shadow-md hover:shadow-lg transition-all duration-300 flex justify-between items-center gap-4"
                            >
                                <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                                <svg
                                    className={`w-6 h-6 text-orange-500 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openIndex === index && (
                                <div className="bg-white rounded-b-xl px-6 pb-6 pt-2 -mt-2 shadow-md animate-fadeIn">
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
