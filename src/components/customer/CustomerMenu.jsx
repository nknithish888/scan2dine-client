import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Loader2,
    UtensilsCrossed,
    Leaf,
    Drumstick,
    Sparkles,
    ShoppingCart,
    Search,
    AlertCircle,
    Minus,
    Plus,
    X,
    CheckCircle2,
    Send,
    Wallet,
    CreditCard,
    Smartphone,
    Banknote
} from 'lucide-react';
import api, { API_BASE_URL } from '../config/api';
import Popup from '../common/Popup';
import usePopup from '../../hooks/usePopup';

const CustomerMenu = () => {
    const { restaurantSlug, tableNumber } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [restaurantName, setRestaurantName] = useState('');
    const [restaurantId, setRestaurantId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const { popupState, closePopup, showWarning, showError } = usePopup();

    useEffect(() => {
        fetchMenu();
    }, [restaurantSlug]);

    const fetchMenu = async () => {
        try {
            const response = await api.get(`/menu/public/${restaurantSlug}`);
            if (response.data.success) {
                setMenuItems(response.data.data);
                setRestaurantName(response.data.restaurantName);
                // Get restaurant ID from first menu item
                if (response.data.data.length > 0) {
                    setRestaurantId(response.data.data[0].restaurantOwner);
                }
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            setError('Failed to load menu. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem._id === item._id);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem._id === item._id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    const updateQuantity = (itemId, change) => {
        setCart(cart.map(item => {
            if (item._id === itemId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const placeOrder = async () => {
        if (!customerName.trim()) {
            showWarning('Please enter your name');
            return;
        }

        if (cart.length === 0) {
            showWarning('Your cart is empty');
            return;
        }

        setIsOrdering(true);

        try {
            const orderData = {
                restaurantId: restaurantId,
                restaurantName: restaurantName,
                customerName: customerName.trim(),
                tableNumber,
                items: cart.map(item => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    isCombo: item.isCombo || false,
                    comboItems: item.comboItems || []
                })),
                totalAmount: getTotalPrice(),
                paymentMethod: paymentMethod
            };

            await api.post('/orders', orderData);

            setOrderSuccess(true);
            setTimeout(() => {
                setCart([]);
                setCustomerName('');
                setShowCart(false);
                setOrderSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error placing order:', error);
            showError('Failed to place order. Please try again.');
        } finally {
            setIsOrdering(false);
        }
    };

    // Get unique categories
    const categories = ['All', ...new Set(menuItems.map(item => item.category))];

    // Filter menu items (Exclude combos from the main list as they are shown at the top)
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const isNotCombo = !item.isCombo; // Exclude combos
        return matchesSearch && matchesCategory && isNotCombo;
    });

    // Group by category
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-32">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4 sticky top-0 z-40 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                            <UtensilsCrossed className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black">{restaurantName}</h1>
                            <p className="text-orange-100 font-semibold">Table {tableNumber}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl text-white placeholder:text-white/70 font-semibold outline-none focus:bg-white/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Special Combo Offers - Top Highlight */}
            {menuItems.filter(item => item.isCombo).length > 0 && (
                <div className="max-w-4xl mx-auto px-4 py-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full animate-pulse"></span>
                            Special Deals 🎁
                        </h2>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-glow">Limited Time</span>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x">
                        {menuItems.filter(item => item.isCombo).map(item => (
                            <div
                                key={`featured-${item._id}`}
                                onClick={() => setSelectedCombo(item)}
                                className="min-w-[280px] sm:min-w-[320px] bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-indigo-100 animate-combo-border snap-center relative group cursor-pointer"
                            >
                                <div className="absolute top-4 left-4 z-20 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black animate-sparkle shadow-lg">
                                    TOP PICK
                                </div>

                                {item.image && (
                                    <div className="h-40 relative">
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-black text-xl line-clamp-1">{item.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white text-lg font-black">₹{item.price}</p>
                                                {item.savingAmount > 0 && (
                                                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black animate-glow">
                                                        SAVE ₹{item.savingAmount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!item.image && (
                                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600">
                                        <h3 className="text-white font-black text-xl mb-1">{item.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">₹{item.price}</p>
                                            {item.savingAmount > 0 && (
                                                <span className="text-[10px] bg-white text-indigo-600 px-2 py-0.5 rounded-full font-black">
                                                    SAVE ₹{item.savingAmount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {item.comboItems?.slice(0, 3).map((ci, i) => (
                                            <span key={i} className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-black border border-indigo-100">
                                                {ci}
                                            </span>
                                        ))}
                                        {item.comboItems?.length > 3 && (
                                            <span className="text-[9px] text-gray-400 font-bold">+{item.comboItems.length - 3} more</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                        }}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Special Combo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="sticky top-[176px] z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4">
                <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-400">No items found</p>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {items.map(item => {
                                    const cartItem = cart.find(c => c._id === item._id);
                                    const quantity = cartItem?.quantity || 0;

                                    return (
                                        <div
                                            key={item._id}
                                            className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 ${item.isCombo ? 'animate-combo-border' : ''}`}
                                        >
                                            {/* Item Image */}
                                            {item.image && (
                                                <div className="relative h-48 bg-gray-100 overflow-hidden group">
                                                    <img
                                                        src={item.image.startsWith('http') ? item.image : `${API_BASE_URL.replace('/api', '')}${item.image}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    {item.isCombo && (
                                                        <>
                                                            <div className="absolute inset-0 bg-shimmer pointer-events-none"></div>
                                                            <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg animate-glow z-10">
                                                                <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
                                                                <span className="tracking-widest">COMBO OFFER</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        {item.isVegetarian ? (
                                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <Leaf className="w-5 h-5 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <Drumstick className="w-5 h-5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Item Details */}
                                            <div className={`p-6 relative ${item.isCombo ? 'bg-gradient-to-b from-indigo-50/30 to-white' : ''}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                                                        {item.isCombo && !item.image && (
                                                            <span className="px-2 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded-full animate-glow">COMBO</span>
                                                        )}
                                                    </div>
                                                    {!item.image && (
                                                        <div>
                                                            {item.isVegetarian ? (
                                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                    <Leaf className="w-4 h-4 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                                    <Drumstick className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-sm font-medium mb-3 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                {/* Combo Items */}
                                                {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
                                                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 shadow-inner">
                                                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" /> Includes in this deal:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.comboItems.map((comboItem, idx) => (
                                                                <span key={idx} className="text-[10px] bg-white text-indigo-600 px-2.5 py-1 rounded-lg font-black shadow-sm border border-indigo-50">
                                                                    {comboItem}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="text-2xl font-black text-orange-600">
                                                        ₹{item.price}
                                                    </div>
                                                    {quantity === 0 ? (
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                            Add
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 bg-orange-500 rounded-full p-1">
                                                            <button
                                                                onClick={() => updateQuantity(item._id, -1)}
                                                                className="w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-black hover:bg-orange-50 transition-all"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-white font-black px-3">{quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item._id, 1)}
                                                                className="w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-black hover:bg-orange-50 transition-all"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && !showCart && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-all hover:scale-110"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-black">
                            {getTotalItems()}
                        </span>
                    </button>
                </div>
            )}

            {/* Combo Details Modal */}
            {selectedCombo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedCombo(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-scaleIn shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="relative h-48 sm:h-64">
                            <img
                                src={selectedCombo.image.startsWith('http') ? selectedCombo.image : `${API_BASE_URL.replace('/api', '')}${selectedCombo.image}`}
                                alt={selectedCombo.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <button
                                onClick={() => setSelectedCombo(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-indigo-600 text-[10px] text-white font-black rounded-full animate-glow uppercase">Premium Combo</span>
                                    {selectedCombo.savingAmount > 0 && (
                                        <span className="px-3 py-1 bg-green-500 text-[10px] text-white font-black rounded-full uppercase">Save ₹{selectedCombo.savingAmount}</span>
                                    )}
                                </div>
                                <h3 className="text-3xl font-black text-white">{selectedCombo.name}</h3>
                            </div>
                        </div>

                        <div className="p-8">
                            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                {selectedCombo.description}
                            </p>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> ITEMS INCLUDED IN THIS DEAL
                                </h4>

                                <div className="grid grid-cols-1 gap-3">
                                    {selectedCombo.comboItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                                                {idx + 1}
                                            </div>
                                            <p className="font-extrabold text-gray-800">{item}</p>
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Total Combo Price</p>
                                    <p className="text-3xl font-black text-gray-900">₹{selectedCombo.price}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        addToCart(selectedCombo);
                                        setSelectedCombo(null);
                                    }}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                                >
                                    Add to Order
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Cart Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black">Your Order</h2>
                                <p className="text-orange-100 font-semibold">{getTotalItems()} items • ₹{getTotalPrice()}</p>
                            </div>
                            <button
                                onClick={() => setShowCart(false)}
                                className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.map(item => (
                                <div key={item._id} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-600 font-semibold">₹{item.price} each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item._id, -1)}
                                            className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-black text-gray-900 w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, 1)}
                                            className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="font-black text-orange-600 w-20 text-right">
                                        ₹{item.price * item.quantity}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Customer Name Input */}
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                                />
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cash'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <Banknote className="w-6 h-6" />
                                        <span className="font-bold text-sm">Cash</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'card'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <CreditCard className="w-6 h-6" />
                                        <span className="font-bold text-sm">Card</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'upi'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <Smartphone className="w-6 h-6" />
                                        <span className="font-bold text-sm">UPI</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('wallet')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'wallet'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        <Wallet className="w-6 h-6" />
                                        <span className="font-bold text-sm">Wallet</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Success Message */}
                        {orderSuccess && (
                            <div className="absolute inset-0 bg-white flex items-center justify-center">
                                <div className="text-center">
                                    <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h3>
                                    <p className="text-gray-600 font-semibold">Your order has been sent to the kitchen</p>
                                </div>
                            </div>
                        )}

                        {/* Cart Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-black text-gray-900">Total</span>
                                <span className="text-3xl font-black text-orange-600">₹{getTotalPrice()}</span>
                            </div>
                            <button
                                onClick={placeOrder}
                                disabled={isOrdering || cart.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isOrdering ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup */}
            <Popup
                isOpen={popupState.isOpen}
                onClose={closePopup}
                title={popupState.title}
                message={popupState.message}
                type={popupState.type}
                onConfirm={popupState.onConfirm}
                confirmText={popupState.confirmText}
                cancelText={popupState.cancelText}
            />
        </div>
    );
};

export default CustomerMenu;
