import React, { useState, useEffect } from 'react';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Search,
    Download,
    Printer,
    FileText,
    Calendar,
    Filter,
    ChevronRight,
    Loader2
} from 'lucide-react';
import api from '../config/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

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
            console.error('Error fetching order history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            preparing: 'bg-blue-50 text-blue-600 border-blue-200',
            ready: 'bg-green-50 text-green-600 border-green-200',
            served: 'bg-gray-50 text-gray-600 border-gray-200',
            cancelled: 'bg-red-50 text-red-600 border-red-200'
        };
        return styles[status] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank');
        const orderDate = new Date(order.createdAt).toLocaleString();

        const html = `
            <html>
                <head>
                    <title>Invoice - Table ${order.tableNumber}</title>
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
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="restaurant-name">${order.restaurantName}</div>
                        <div class="restaurant-sub">Official Invoice</div>
                    </div>
                    <div class="info-grid">
                        <div>
                            <div class="info-label">Customer</div>
                            <div class="info-value">${order.customerName}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="info-label">Order Date</div>
                            <div class="info-value">${orderDate}</div>
                        </div>
                        <div style="margin-top: 20px;">
                            <div class="info-label">Table Number</div>
                            <div class="info-value">Table ${order.tableNumber}</div>
                        </div>
                        <div style="text-align: right; margin-top: 20px;">
                            <div class="info-label">Order ID</div>
                            <div class="info-value">#${order._id.substring(order._id.length - 8).toUpperCase()}</div>
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
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
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
                            <span class="total-value">₹${order.totalAmount}</span>
                        </div>
                        <div style="color: #64748b; font-size: 14px; font-weight: 700;">
                            Payment Method: ${order.paymentMethod.toUpperCase()}
                        </div>
                    </div>
                    <div class="footer">
                        Thank you for dining with us! Visit again soon.<br>
                        Generated via Scan2Dine System
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch =
            order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">Order History</h2>
                    <p className="text-gray-500 font-medium">Review and manage all historical orders</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID, table, or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent shadow-sm rounded-2xl focus:outline-none focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-gray-700"
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="p-3 bg-white border-2 border-transparent transition-all hover:bg-gray-50 rounded-2xl shadow-sm text-gray-500"
                    >
                        <Calendar className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {['all', 'pending', 'preparing', 'ready', 'served', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${filterStatus === status
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders Table-styled Grid */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Customer & Table</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                                        <p className="font-bold text-gray-400">Fetching order history...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="font-bold text-gray-400">No orders found matching your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                                #{order._id.substring(order._id.length - 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900">{order.customerName}</span>
                                                <span className="text-xs font-bold text-orange-500">Table {order.tableNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handlePrint(order)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                                                    title="Print Bill"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(order)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
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

            {/* Print Instructions */}
            <div className="mt-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] p-8 flex items-start gap-6">
                <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm border border-blue-100">
                    <Printer className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-blue-900 mb-1">Smart Printing Tip</h4>
                    <p className="text-blue-700 font-medium text-sm leading-relaxed">
                        When the print window opens, you can choose "Save as PDF" to download the invoice locally, or select your receipt printer to print a physical bill for the customer.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
