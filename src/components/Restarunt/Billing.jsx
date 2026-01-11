import React, { useState, useEffect, useCallback } from 'react';
import {
    Receipt,
    Search,
    Filter,
    Printer,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    CreditCard,
    Smartphone,
    ArrowRight,
    Loader2,
    Calendar,
    ChevronDown,
    Trash2,
    Plus,
    Minus,
    AlertTriangle,
    X,
    Sparkles
} from 'lucide-react';
import api from '../config/api';
import Popup from '../common/Popup';

const Billing = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid
    const [timeFilter, setTimeFilter] = useState('today'); // today, yesterday, this-week, all

    // Popup and Modal states
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showEditBillModal, setShowEditBillModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [editingItems, setEditingItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching billing data:', error);
            setPopup({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load billing information.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (orderId, currentStatus, paymentMethod = null) => {
        // If marking as paid and no payment method provided, show modal first
        if (currentStatus === 'unpaid' && !paymentMethod) {
            setSelectedOrder(orders.find(o => o._id === orderId));
            setShowPaymentMethodModal(true);
            return;
        }

        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        try {
            const updateData = { paymentStatus: newStatus };
            if (paymentMethod) {
                updateData.paymentMethod = paymentMethod;
            }

            const response = await api.put(`/orders/${orderId}`, updateData);
            if (response.data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: newStatus, paymentMethod: paymentMethod || o.paymentMethod } : o));
                setShowPaymentMethodModal(false);
                setPopup({
                    isOpen: true,
                    title: 'Status Updated',
                    message: `Payment marked as ${newStatus.toUpperCase()}${paymentMethod ? ` - ${paymentMethod}` : ''}`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    const triggerPrint = (order) => {
        const printWindow = window.open('', '_blank');
        const orderDate = new Date(order.createdAt).toLocaleString();

        const html = `
            <html>
                <head>
                    <title>Bill - Table ${order.tableNumber}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
                        .restaurant-name { font-size: 24px; font-weight: 900; color: #f97316; margin-bottom: 5px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 10px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 12px; }
                        td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                        .total-row { display: flex; justify-content: flex-end; gap: 20px; margin-top: 20px; }
                        .total-value { font-size: 20px; font-weight: 900; color: #f97316; }
                        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="restaurant-name">${order.restaurantName}</div>
                        <div>TAX INVOICE</div>
                    </div>
                    <div class="info-grid">
                        <div>
                            <div>CUSTOMER: ${order.customerName}</div>
                            <div>TABLE: ${order.tableNumber}</div>
                        </div>
                        <div style="text-align: right;">
                            <div>DATE: ${orderDate}</div>
                            <div>ORDER ID: #${order._id.substring(order._id.length - 6).toUpperCase()}</div>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        ${item.name}
                                        ${item.isCombo ? `<div style="font-size: 10px; color: #4f46e5; font-weight: 800; margin-top: 2px;">(COMBO: ${item.comboItems.join(', ')})</div>` : ''}
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total-row">
                        <span style="font-weight: bold;">Grand Total:</span>
                        <span class="total-value">₹${order.totalAmount}</span>
                    </div>
                    <div class="footer">Thank you! Visit again.</div>
                    <script>window.onload = () => { window.print(); window.close(); };</script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const filteredOrders = orders.filter(order => {
        // Time filter logic
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const isToday = orderDate.toDateString() === now.toDateString();

        const matchesTime =
            timeFilter === 'all' ||
            (timeFilter === 'today' && isToday);

        const matchesStatus =
            statusFilter === 'all' ||
            order.paymentStatus === statusFilter;

        const matchesSearch =
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTime && matchesStatus && matchesSearch;
    }).sort((a, b) => {
        // Sort by status priority: active orders first
        const isActiveA = a.status !== 'served' && a.status !== 'cancelled';
        const isActiveB = b.status !== 'served' && b.status !== 'cancelled';
        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;
        // Then by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Stats calculation
    const todaySales = orders.filter(o =>
        new Date(o.createdAt).toDateString() === new Date().toDateString() &&
        o.paymentStatus === 'paid' &&
        o.status !== 'cancelled'
    ).reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCollection = orders.filter(o =>
        o.paymentStatus === 'unpaid' &&
        o.status !== 'cancelled'
    ).reduce((sum, o) => sum + o.totalAmount, 0);

    // Split filtered orders into Active (Unpaid) and History (Paid/Cancelled)
    const activeBills = filteredOrders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled');
    const historyBills = filteredOrders.filter(o => o.paymentStatus === 'paid' || o.status === 'cancelled');

    return (
        <div className="animate-fadeIn p-2">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1 flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-orange-500" />
                        Billing Dashboard
                    </h2>
                    <p className="text-gray-500 font-medium font-sans">Manage invoices, payments and collections</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[200px] lg:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customer or table..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-gray-700 shadow-sm"
                        />
                    </div>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 focus:outline-none shadow-sm"
                    >
                        <option value="today">Today</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Collected Today</span>
                    </div>
                    <h3 className="text-4xl font-black">₹{todaySales}</h3>
                    <p className="text-green-100 font-medium mt-1">Successfully settled payments</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Pending Settlement</span>
                    </div>
                    <h3 className="text-4xl font-black">₹{pendingCollection}</h3>
                    <p className="text-orange-100 font-medium mt-1">Unpaid orders requiring attention</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Receipt className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">{filteredOrders.length}</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Invoices</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Bills Section (Cards) */}
            {activeBills.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider">Active Tables / Due Bills</h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black">{activeBills.length}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeBills.map((order) => (
                            <div key={order._id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100">
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900">Table {order.tableNumber}</h4>
                                        <p className="text-sm text-gray-500 font-medium mt-1">{order.customerName}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${order.status === 'served' ? 'bg-gray-100 text-gray-500' :
                                            order.status === 'ready' ? 'bg-green-100 text-green-600' :
                                                order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={() => triggerPrint(order)}
                                            className="p-2 bg-gray-50 text-gray-400 hover:bg-orange-500 hover:text-white rounded-lg transition-all border border-gray-100"
                                            title="Print Bill"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className={`p-3 rounded-xl transition-all mb-2 ${item.isCombo
                                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100'
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
                                                </div>
                                                <span className={`font-black ${item.isCombo ? 'text-indigo-600' : 'text-orange-600'}`}>
                                                    ₹{item.price * item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total & Action */}
                                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl mb-6">
                                    <span className="font-black text-gray-700">Total Due</span>
                                    <span className="text-2xl font-black text-orange-600">₹{order.totalAmount}</span>
                                </div>

                                <button
                                    onClick={() => handleUpdatePaymentStatus(order._id, 'unpaid')}
                                    className="w-full py-3 bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-xl font-bold text-sm transition-all uppercase tracking-wider"
                                >
                                    Mark as Paid
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invoices Table Container (History) */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-xl font-black text-gray-900">Recent Transactions</h3>
                    <div className="flex gap-2">
                        {/* Removed status toggles as table is now history-focused, but keeping visual filter if needed or remove entirely */}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                                        <p className="font-bold text-gray-400">Loading Billing Data...</p>
                                    </td>
                                </tr>
                            ) : historyBills.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Receipt className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                        <p className="font-bold text-gray-400 text-lg">No Recent Transactions</p>
                                        <p className="text-gray-300 font-medium">Paid bills will appear here</p>
                                    </td>
                                </tr>
                            ) : (
                                historyBills.map((order) => (
                                    <tr key={order._id} className="hover:bg-orange-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-orange-500 shadow-sm">
                                                    {order.tableNumber}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-none mb-1">{order.customerName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                        #{order._id.substring(order._id.length - 6).toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'served' ? 'bg-gray-100 text-gray-500' :
                                                order.status === 'ready' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {order.paymentMethod === 'cash' ? (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                                                    <DollarSign className="w-3.5 h-3.5" /> Cash
                                                </div>
                                            ) : order.paymentMethod === 'online' ? (
                                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                                                    <Smartphone className="w-3.5 h-3.5" /> UPI/Online
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest">
                                                    <CreditCard className="w-3.5 h-3.5" /> Card
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-gray-900 text-lg">₹{order.totalAmount}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(order._id, order.paymentStatus)}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {order.paymentStatus}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => triggerPrint(order)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-orange-500 hover:shadow-md transition-all"
                                                    title="Quick Print"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setEditingItems([...order.items]);
                                                        setShowEditBillModal(true);
                                                    }}
                                                    className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                                                >
                                                    Edit <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Order Modal (Shared logic with LiveOrders) */}
            {showEditBillModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">✏️ Revise Billing</h3>
                                <p className="text-sm text-gray-600 font-medium mt-1">
                                    Table {selectedOrder.tableNumber} • Adjusting items for #${selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
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
                                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${item.isCombo
                                        ? 'bg-indigo-50 border-indigo-100 group hover:bg-white'
                                        : 'bg-gray-50 border-gray-100 group hover:bg-white'
                                    }`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-gray-900">{item.name}</p>
                                            {item.isCombo && (
                                                <span className="px-2 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded-full uppercase">Combo</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-orange-600 mt-0.5">₹{item.price} per unit</p>
                                        {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.comboItems.map((cItem, cIdx) => (
                                                    <span key={cIdx} className="text-[9px] text-indigo-600 font-bold">• {cItem}</span>
                                                ))}
                                            </div>
                                        )}
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
                                    <p className="font-bold text-gray-500">No items left. Add at least one item.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjusted Total</p>
                                    <p className="text-3xl font-black text-orange-600">
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
                                                    setShowEditBillModal(false);
                                                    setPopup({
                                                        isOpen: true,
                                                        title: 'Bill Updated',
                                                        message: 'The order total has been successfully adjusted.',
                                                        type: 'success'
                                                    });
                                                }
                                            } catch (error) {
                                                console.error('Error updating bill:', error);
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }}
                                        disabled={editingItems.length === 0 || isUpdating}
                                        className="px-8 py-3 bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
                                    >
                                        {isUpdating ? 'Saving...' : 'Confirm Bill Change'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Selection Modal */}
            {showPaymentMethodModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">💳 Payment Method</h3>
                                    <p className="text-sm text-gray-600 font-medium mt-1">
                                        Select how Table {selectedOrder.tableNumber} is paying
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentMethodModal(false)}
                                    className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-6">
                                <p className="text-2xl font-black text-orange-600 mb-2">₹{selectedOrder.totalAmount}</p>
                                <p className="text-xs text-gray-500 font-medium">Total Amount to be Collected</p>
                            </div>

                            <div className="space-y-3">
                                {/* UPI Option */}
                                <button
                                    onClick={() => setSelectedPaymentMethod('upi')}
                                    className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedPaymentMethod === 'upi'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === 'upi' ? 'bg-blue-500' : 'bg-gray-100'
                                        }`}>
                                        <Smartphone className={`w-6 h-6 ${selectedPaymentMethod === 'upi' ? 'text-white' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-black text-gray-900">UPI / Online</p>
                                        <p className="text-xs text-gray-500 font-medium">PhonePe, GPay, Paytm</p>
                                    </div>
                                    {selectedPaymentMethod === 'upi' && (
                                        <CheckCircle className="w-6 h-6 text-blue-500" />
                                    )}
                                </button>

                                {/* Cash Option */}
                                <button
                                    onClick={() => setSelectedPaymentMethod('cash')}
                                    className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedPaymentMethod === 'cash'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === 'cash' ? 'bg-green-500' : 'bg-gray-100'
                                        }`}>
                                        <DollarSign className={`w-6 h-6 ${selectedPaymentMethod === 'cash' ? 'text-white' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-black text-gray-900">Cash</p>
                                        <p className="text-xs text-gray-500 font-medium">Physical currency</p>
                                    </div>
                                    {selectedPaymentMethod === 'cash' && (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    )}
                                </button>

                                {/* Cash + UPI Option */}
                                <button
                                    onClick={() => setSelectedPaymentMethod('cash+upi')}
                                    className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedPaymentMethod === 'cash+upi'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === 'cash+upi' ? 'bg-purple-500' : 'bg-gray-100'
                                        }`}>
                                        <CreditCard className={`w-6 h-6 ${selectedPaymentMethod === 'cash+upi' ? 'text-white' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-black text-gray-900">Cash + UPI</p>
                                        <p className="text-xs text-gray-500 font-medium">Split payment method</p>
                                    </div>
                                    {selectedPaymentMethod === 'cash+upi' && (
                                        <CheckCircle className="w-6 h-6 text-purple-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowPaymentMethodModal(false)}
                                className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-500 rounded-2xl font-black hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpdatePaymentStatus(selectedOrder._id, 'unpaid', selectedPaymentMethod);
                                }}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-500/30 hover:shadow-xl transition-all"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Popup
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
            />
        </div>
    );
};

export default Billing;
