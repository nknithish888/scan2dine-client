const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: ['Features', 'Pricing', 'How It Works', 'Demo'],
        Company: ['About Us', 'Careers', 'Blog', 'Press'],
        Resources: ['Help Center', 'Tutorials', 'API Docs', 'Community'],
        Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
    };

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container">
                {/* Main Footer Content */}
                <div className="grid md:grid-cols-5 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">Scan2Dine</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-sm">
                            Modernize your restaurant with digital menus. Fast, contactless, and always up-to-date.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`#${social}`}
                                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-orange-500 hover:to-green-500 flex items-center justify-center transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4 text-white">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="border-t border-gray-800 pt-8 mb-8">
                    <div className="max-w-md">
                        <h4 className="font-semibold mb-2">Stay Updated</h4>
                        <p className="text-gray-400 mb-4 text-sm">Get the latest news and updates from Scan2Dine</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none text-white placeholder-gray-500"
                            />
                            <button className="btn btn-primary">Subscribe</button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Scan2Dine. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                            Privacy
                        </a>
                        <a href="#terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                            Terms
                        </a>
                        <a href="#cookies" className="text-gray-400 hover:text-orange-400 transition-colors">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
