import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Users,
    ChefHat,
    Loader2,
    Filter,
    Search,
    Printer,
    RefreshCw,
    Plus,
    Minus,
    Trash2,
    AlertTriangle,
    Bell,
    X,
    Download
} from 'lucide-react';
import api from '../config/api';
import useOrderNotification from '../../hooks/useOrderNotification';
import AudioDebugPanel from './AudioDebugPanel';
import Popup from '../common/Popup';

const LiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBillModal, setShowBillModal] = useState(false);
    const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cashAmount, setCashAmount] = useState('');
    const [onlineAmount, setOnlineAmount] = useState('');
    const [showPrintPrompt, setShowPrintPrompt] = useState(false);
    const [isCheckingPrinter, setIsCheckingPrinter] = useState(false);
    const [showEditBillModal, setShowEditBillModal] = useState(false);
    const [editingItems, setEditingItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // Enable audio notifications for new orders
    const { playManualNotification, isPlaying, currentTable, stopAudio } = useOrderNotification(orders);


    useEffect(() => {
        fetchOrders();

        // Refresh orders every 5 seconds for faster notification (reduced from 30s)
        const interval = setInterval(fetchOrders, 5000);

        // Also refresh when tab becomes visible (user switches back to the tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchOrders();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePrintClick = (order) => {
        setSelectedOrder(order);
        setShowBillModal(true);
    };

    const handlePrintRequest = () => {
        setIsCheckingPrinter(true);
        // Simulate printer connection check
        setTimeout(() => {
            setIsCheckingPrinter(false);
            setShowBillModal(true);
        }, 1500);
    };

    const triggerPrint = () => {
        const printWindow = window.open('', '_blank');
        const orderDate = new Date(selectedOrder.createdAt).toLocaleString();

        const html = `
            <html>
                <head>
                    <title>Bill - Table ${selectedOrder.tableNumber}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
                        .restaurant-name { font-size: 28px; font-weight: 900; color: #f97316; margin-bottom: 5px; }
                        .restaurant-sub { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 40px; }
                        .info-label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
                        .info-value { font-size: 16px; font-weight: 700; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding: 12px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
                        .total-section { text-align: right; }
                        .total-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 10px; }
                        .total-label { font-weight: 700; color: #64748b; }
                        .total-value { font-size: 24px; font-weight: 900; color: #f97316; }
                        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="restaurant-name">${selectedOrder.restaurantName}</div>
                        <div class="restaurant-sub">Order Receipt</div>
                    </div>
                    <div class="info-grid">
                        <div>
                            <div class="info-label">Customer</div>
                            <div class="info-value">${selectedOrder.customerName}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="info-label">Order Date</div>
                            <div class="info-value">${orderDate}</div>
                        </div>
                        <div style="margin-top: 20px;">
                            <div class="info-label">Table Number</div>
                            <div class="info-value">Table ${selectedOrder.tableNumber}</div>
                        </div>
                        <div style="text-align: right; margin-top: 20px;">
                            <div class="info-label">Order ID</div>
                            <div class="info-value">#${selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</div>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedOrder.items.map(item => `
                                <tr>
                                    <td>
                                        ${item.name}
                                        ${item.isCombo ? `<div style="font-size: 10px; color: #4f46e5; font-weight: 800; margin-top: 2px;">(COMBO: ${item.comboItems.join(', ')})</div>` : ''}
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">₹${item.price}</td>
                                    <td style="text-align: right;">₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total-section">
                        <div class="total-row">
                            <span class="total-label">Grand Total</span>
                            <span class="total-value">₹${selectedOrder.totalAmount}</span>
                        </div>
                        <div style="color: #64748b; font-size: 14px; font-weight: 700;">
                            Payment Method: ${selectedOrder.paymentMethod.toUpperCase()}
                        </div>
                    </div>
                    <div class="footer">
                        Thank you for dining with us!<br>
                        Generated via Scan2Dine
                    </div>
                    <script>
                        window.onload = () => { window.print(); window.close(); };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders/live');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        // Optimistic UI Update: Update local state immediately
        setOrders(prevOrders => prevOrders.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            // Send request in background
            await api.put(`/orders/${orderId}`, { status: newStatus });
            // Note: We don't strictly need to fetchOrders immediately if the optimistic update was correct,
            // but we can do it silently or later to ensure consistency.
        } catch (error) {
            console.error('Error updating order:', error);
            // Revert changes on error by fetching original data
            fetchOrders();
        }
    }, [fetchOrders]);

    const updatePaymentStatus = useCallback(async (orderId, paymentStatus) => {
        // Optimistic UI Update
        setOrders(prevOrders => prevOrders.map(order =>
            order._id === orderId ? { ...order, paymentStatus: paymentStatus } : order
        ));

        try {
            await api.put(`/orders/${orderId}`, { paymentStatus });
        } catch (error) {
            console.error('Error updating payment:', error);
            fetchOrders();
        }
    }, [fetchOrders]);

    const updatePaymentMethod = useCallback(async (orderId, paymentMethod, splitPayment = null) => {
        // Optimistic UI Update
        setOrders(prevOrders => prevOrders.map(order =>
            order._id === orderId ? {
                ...order,
                paymentMethod: paymentMethod,
                splitPayment: splitPayment || (paymentMethod !== 'split' ? undefined : order.splitPayment)
            } : order
        ));

        try {
            const payload = { paymentMethod };
            if (splitPayment) {
                payload.splitPayment = splitPayment;
            }
            await api.put(`/orders/${orderId}`, payload);
        } catch (error) {
            console.error('Error updating payment method:', error);
            fetchOrders();
        }
    }, [fetchOrders]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            preparing: 'bg-blue-100 text-blue-700 border-blue-300',
            ready: 'bg-green-100 text-green-700 border-green-300',
            served: 'bg-gray-100 text-gray-700 border-gray-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            preparing: ChefHat,
            ready: Package,
            served: CheckCircle
        };
        const Icon = icons[status] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
            const matchesSearch = order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [orders, filterStatus, searchTerm]);

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">Live Orders</h2>
                    <p className="text-gray-500 font-medium">Track and manage active orders in real-time</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search table or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-medium text-gray-700"
                        />
                    </div>

                    {/* Manual Refresh Button */}
                    <button
                        onClick={() => {
                            console.log('🔄 Manual refresh triggered');
                            fetchOrders();
                        }}
                        className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 group"
                        title="Refresh Orders (Check for New Orders)"
                    >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>

                    {/* Test Notification Button */}
                    <button
                        onClick={() => playManualNotification(1)}
                        className="p-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 group"
                        title="Test Audio Notification (Table 1)"
                    >
                        <Bell className="w-5 h-5 group-hover:animate-bounce" />
                    </button>
                </div>
            </div>

            {/* Audio Playing Notification Banner */}
            {isPlaying && currentTable && (
                <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-orange-500/30 animate-fadeIn">
                    <div className="relative">
                        <Bell className="w-6 h-6 text-white animate-bounce" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-black text-lg">
                            🔔 Playing Audio Notification
                        </p>
                        <p className="text-orange-100 text-sm font-medium">
                            New order received for Table {currentTable}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <span className="w-1 h-6 bg-white/60 rounded-full animate-pulse"></span>
                            <span className="w-1 h-6 bg-white/80 rounded-full animate-pulse delay-75"></span>
                            <span className="w-1 h-6 bg-white rounded-full animate-pulse delay-150"></span>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {['all', 'pending', 'preparing', 'ready', 'served'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'All Orders' : status}
                        {status !== 'all' && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {orders.filter(o => o.status === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-xl font-bold text-gray-900">Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 p-24 text-center">
                    <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Active Orders</h3>
                    <p className="text-gray-500 font-medium">New orders will appear here automatically</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100">
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900">Table {order.tableNumber}</h4>
                                    <p className="text-sm text-gray-500 font-medium mt-1">{order.customerName}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                    <button
                                        onClick={() => handlePrintClick(order)}
                                        className="p-2 bg-gray-50 text-gray-400 hover:bg-orange-500 hover:text-white rounded-lg transition-all border border-gray-100"
                                        title="Generate Bill"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Order Items */}
                            {/* Order Items - Full View */}
                            <div className="space-y-3 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={`p-3 rounded-xl transition-all ${item.isCombo
                                        ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-100'
                                        : 'bg-gray-50'
                                        }`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    {item.isCombo && (
                                                        <span className="px-2 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded-full flex items-center gap-1 uppercase">
                                                            <Sparkles className="w-2 h-2" /> Combo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold">Qty: {item.quantity}</p>

                                                {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {item.comboItems.map((cItem, cIdx) => (
                                                            <span key={cIdx} className="px-1.5 py-0.5 bg-white/60 text-[9px] text-indigo-700 font-black rounded-md">
                                                                • {cItem}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {item.specialInstructions && (
                                                    <p className="text-xs text-orange-600 italic mt-1 font-medium">{item.specialInstructions}</p>
                                                )}
                                            </div>
                                            <span className={`font-black ${item.isCombo ? 'text-indigo-600' : 'text-orange-600'}`}>
                                                ₹{item.price * item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl mb-6">
                                <span className="font-black text-gray-700">Total Amount</span>
                                <span className="text-2xl font-black text-orange-600">₹{order.totalAmount}</span>
                            </div>



                            {/* Payment Method Display */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                <div className="flex items-center gap-2">
                                    {order.paymentMethod === 'cash' && <span className="text-green-600 font-black flex items-center gap-2">💵 Cash</span>}
                                    {order.paymentMethod === 'online' && <span className="text-blue-600 font-black flex items-center gap-2">💳 Online/UPI</span>}
                                    {order.paymentMethod === 'card' && <span className="text-purple-600 font-black flex items-center gap-2">💳 Card</span>}
                                    {!order.paymentMethod && <span className="text-gray-400 font-bold italic">Not specified</span>}
                                </div>
                            </div>


                            {/* Order Time */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400 font-medium">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bill Preview Modal */}
            {showBillModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900">Bill Preview</h3>
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Bill Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto bg-white">
                            <div className="border-4 border-double border-gray-100 rounded-3xl p-6">
                                <div className="text-center mb-8 border-b-2 border-dashed border-gray-100 pb-6">
                                    <h4 className="text-2xl font-black text-orange-500 mb-1">{selectedOrder.restaurantName}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Order Receipt</p>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm font-bold">
                                    <div>
                                        <p className="text-gray-400 text-[10px] uppercase mb-0.5">Customer</p>
                                        <p className="text-gray-800">{selectedOrder.customerName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-[10px] uppercase mb-0.5">Date</p>
                                        <p className="text-gray-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-[10px] uppercase mb-0.5">Table</p>
                                        <p className="text-orange-500 font-black">Table # {selectedOrder.tableNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-[10px] uppercase mb-0.5">Order ID</p>
                                        <p className="text-gray-800">#{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className={`p-3 rounded-xl mb-2 ${item.isCombo
                                                ? 'bg-indigo-50 border border-indigo-100'
                                                : 'bg-white'
                                            }`}>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-800">{item.name}</p>
                                                        {item.isCombo && (
                                                            <span className="px-2 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded-full uppercase">Combo</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold">{item.quantity} x ₹{item.price}</p>
                                                    {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.comboItems.map((cItem, cIdx) => (
                                                                <span key={cIdx} className="text-[9px] text-indigo-600 font-bold">• {cItem}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`font-black ${item.isCombo ? 'text-indigo-600' : 'text-gray-900'}`}>₹{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-dashed border-gray-100 pt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-500 uppercase text-[10px]">Grand Total</span>
                                        <span className="text-3xl font-black text-orange-500">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 text-center mt-6">
                                        Payment via: <span className="text-gray-800 uppercase">{selectedOrder.paymentMethod}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => {
                                    setEditingItems([...selectedOrder.items]);
                                    setShowBillModal(false);
                                    setShowEditBillModal(true);
                                }}
                                className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center gap-2"
                            >
                                Edit Bill
                            </button>
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={triggerPrint}
                                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <Printer className="w-5 h-5" /> Print Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Bill Prompt */}
            <Popup
                isOpen={showPrintPrompt}
                onClose={() => setShowPrintPrompt(false)}
                title="Print Receipt?"
                message={`Order for Table ${selectedOrder?.tableNumber} has been served. Would you like to print the bill now?`}
                type="confirm"
                confirmText="Yes, Print"
                cancelText="No, Thanks"
                onConfirm={handlePrintRequest}
            />

            {/* Printer Checking Overlay */}
            {isCheckingPrinter && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <Printer className="w-20 h-20 text-orange-500 animate-pulse" />
                            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Connecting Printer...</h3>
                        <p className="text-gray-500 font-medium">Checking hardware status and thermal paper levels</p>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditBillModal && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">✏️ Edit Order Bill</h3>
                                <p className="text-sm text-gray-600 font-medium mt-1">
                                    Table {selectedOrder.tableNumber} • Modifying items and quantities
                                </p>
                            </div>
                            <button
                                onClick={() => setShowEditBillModal(false)}
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
                            {editingItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900">{item.name}</p>
                                        <p className="text-xs font-bold text-orange-600 mt-0.5">₹{item.price} per unit</p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                        <button
                                            onClick={() => {
                                                const newItems = [...editingItems];
                                                if (newItems[idx].quantity > 1) {
                                                    newItems[idx].quantity -= 1;
                                                    setEditingItems(newItems);
                                                }
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-black text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => {
                                                const newItems = [...editingItems];
                                                newItems[idx].quantity += 1;
                                                setEditingItems(newItems);
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="w-24 text-right">
                                        <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const newItems = editingItems.filter((_, i) => i !== idx);
                                            setEditingItems(newItems);
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {editingItems.length === 0 && (
                                <div className="text-center py-10">
                                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                                    <p className="font-bold text-gray-500">No items in the bill. Add at least one item.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjusted Total</p>
                                    <p className="text-3xl font-black text-indigo-600">
                                        ₹{editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowEditBillModal(false)}
                                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (editingItems.length === 0) return;
                                            try {
                                                setIsUpdating(true);
                                                const totalAmount = editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                                const response = await api.put(`/orders/${selectedOrder._id}`, {
                                                    items: editingItems,
                                                    totalAmount: totalAmount
                                                });
                                                if (response.data.success) {
                                                    setOrders(prev => prev.map(o => o._id === selectedOrder._id ? response.data.data : o));
                                                    setSelectedOrder(response.data.data);
                                                    setShowEditBillModal(false);
                                                    setShowBillModal(true);
                                                }
                                            } catch (error) {
                                                console.error('Error updating bill:', error);
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }}
                                        disabled={editingItems.length === 0 || isUpdating}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Saving...' : 'Update & View Bill'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Selection Modal */}
            {showPaymentMethodModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">💳 Select Payment Method</h3>
                                <p className="text-sm text-gray-600 font-medium mt-1">
                                    Table {selectedOrder.tableNumber} • ₹{selectedOrder.totalAmount}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPaymentMethodModal(false)}
                                className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            {/* Current Payment Method */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Current Method</p>
                                <p className="text-lg font-black text-blue-900">
                                    {selectedOrder.splitPayment ? (
                                        <>💰 Split: ₹{selectedOrder.splitPayment.cash} (Cash) + ₹{selectedOrder.splitPayment.online} (Online)</>
                                    ) : selectedOrder.paymentMethod === 'cash' ? (
                                        <>💵 Cash</>
                                    ) : selectedOrder.paymentMethod === 'online' ? (
                                        <>💳 Online/UPI</>
                                    ) : selectedOrder.paymentMethod === 'card' ? (
                                        <>💳 Card</>
                                    ) : (
                                        <>💵 Cash (Default)</>
                                    )}
                                </p>
                            </div>

                            <p className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider">Choose Payment Method:</p>

                            {/* Payment Method Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Cash Button */}
                                <button
                                    onClick={() => {
                                        updatePaymentMethod(selectedOrder._id, 'cash');
                                        setShowPaymentMethodModal(false);
                                    }}
                                    className={`p-6 rounded-2xl border-3 font-bold transition-all hover:scale-105 ${selectedOrder.paymentMethod === 'cash' && !selectedOrder.splitPayment
                                        ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/30'
                                        : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">💵</div>
                                    <div className="text-lg font-black">Cash</div>
                                    <div className="text-xs mt-1 opacity-80">Physical payment</div>
                                </button>

                                {/* Online/UPI Button */}
                                <button
                                    onClick={() => {
                                        updatePaymentMethod(selectedOrder._id, 'online');
                                        setShowPaymentMethodModal(false);
                                    }}
                                    className={`p-6 rounded-2xl border-3 font-bold transition-all hover:scale-105 ${selectedOrder.paymentMethod === 'online' && !selectedOrder.splitPayment
                                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                                        : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">💳</div>
                                    <div className="text-lg font-black">Online/UPI</div>
                                    <div className="text-xs mt-1 opacity-80">Digital payment</div>
                                </button>

                                {/* Card Button */}
                                <button
                                    onClick={() => {
                                        updatePaymentMethod(selectedOrder._id, 'card');
                                        setShowPaymentMethodModal(false);
                                    }}
                                    className={`p-6 rounded-2xl border-3 font-bold transition-all hover:scale-105 ${selectedOrder.paymentMethod === 'card' && !selectedOrder.splitPayment
                                        ? 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/30'
                                        : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">💳</div>
                                    <div className="text-lg font-black">Card</div>
                                    <div className="text-xs mt-1 opacity-80">Credit/Debit</div>
                                </button>

                                {/* Split Payment Button */}
                                <button
                                    onClick={() => {
                                        setShowPaymentMethodModal(false);
                                        setCashAmount(selectedOrder.splitPayment?.cash || '');
                                        setOnlineAmount(selectedOrder.splitPayment?.online || '');
                                        setShowSplitPaymentModal(true);
                                    }}
                                    className={`p-6 rounded-2xl border-3 font-bold transition-all hover:scale-105 ${selectedOrder.splitPayment
                                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-green-600 shadow-lg shadow-green-500/30'
                                        : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-700 border-green-300 hover:from-green-100 hover:to-blue-100'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">💰</div>
                                    <div className="text-lg font-black">Split Payment</div>
                                    <div className="text-xs mt-1 opacity-80">Cash + Online</div>
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                            <button
                                onClick={() => setShowPaymentMethodModal(false)}
                                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Split Payment Modal */}
            {showSplitPaymentModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gradient-to-r from-green-50 to-blue-50">
                            <h3 className="text-xl font-black text-gray-900">💰 Split Payment</h3>
                            <button
                                onClick={() => {
                                    setShowSplitPaymentModal(false);
                                    setCashAmount('');
                                    setOnlineAmount('');
                                }}
                                className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            <div className="mb-6 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                                <p className="text-sm font-bold text-orange-600 mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-orange-600">₹{selectedOrder.totalAmount}</p>
                                <p className="text-xs text-orange-500 mt-1">Table {selectedOrder.tableNumber}</p>
                            </div>

                            <div className="space-y-4">
                                {/* Cash Amount */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        💵 Cash Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={cashAmount}
                                        onChange={(e) => {
                                            const cash = parseFloat(e.target.value) || 0;
                                            setCashAmount(e.target.value);
                                            setOnlineAmount((selectedOrder.totalAmount - cash).toString());
                                        }}
                                        placeholder="Enter cash amount"
                                        className="w-full py-3 px-4 bg-green-50 border-2 border-green-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                    />
                                </div>

                                {/* Online Amount */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        💳 Online/UPI Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={onlineAmount}
                                        onChange={(e) => {
                                            const online = parseFloat(e.target.value) || 0;
                                            setOnlineAmount(e.target.value);
                                            setCashAmount((selectedOrder.totalAmount - online).toString());
                                        }}
                                        placeholder="Enter online amount"
                                        className="w-full py-3 px-4 bg-blue-50 border-2 border-blue-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* Total Check */}
                                <div className={`p-4 rounded-xl border-2 ${(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0) === selectedOrder.totalAmount
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-red-50 border-red-300'
                                    }`}>
                                    <p className="text-sm font-bold text-gray-600">Total Entered:</p>
                                    <p className="text-2xl font-black">
                                        ₹{(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0)}
                                    </p>
                                    {(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0) !== selectedOrder.totalAmount && (
                                        <p className="text-xs text-red-600 font-bold mt-1">
                                            ⚠️ Must equal ₹{selectedOrder.totalAmount}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => {
                                    setShowSplitPaymentModal(false);
                                    setCashAmount('');
                                    setOnlineAmount('');
                                }}
                                className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const cash = parseFloat(cashAmount) || 0;
                                    const online = parseFloat(onlineAmount) || 0;
                                    if (cash + online === selectedOrder.totalAmount && cash > 0 && online > 0) {
                                        updatePaymentMethod(selectedOrder._id, 'split', { cash, online });
                                        setShowSplitPaymentModal(false);
                                        setCashAmount('');
                                        setOnlineAmount('');
                                    }
                                }}
                                disabled={(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0) !== selectedOrder.totalAmount}
                                className={`flex-1 py-4 rounded-2xl font-black transition-all ${(parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0) === selectedOrder.totalAmount
                                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg hover:-translate-y-1'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Save Split Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Panel for Testing Audio */}
            {/* <AudioDebugPanel
                playManualNotification={playManualNotification}
                isPlaying={isPlaying}
                currentTable={currentTable}
                stopAudio={stopAudio}
            /> */}
        </div>
    );
};

export default LiveOrders;
