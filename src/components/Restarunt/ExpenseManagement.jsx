import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    TrendingDown,
    Calendar,
    Tag,
    DollarSign,
    MoreVertical,
    Edit3,
    Trash2,
    Loader2,
    X,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from 'lucide-react';
import api from '../config/api';
import Popup from '../common/Popup';
import usePopup from '../../hooks/usePopup';

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const { popupState, closePopup, showSuccess, showError, showConfirm } = usePopup();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Raw Materials',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'cash'
    });

    const categories = [
        'Raw Materials', 'Rent', 'Electricity', 'Water',
        'Salaries', 'Maintenance', 'Marketing', 'Other'
    ];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses');
            if (response.data.success) {
                setExpenses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                await api.put(`/expenses/${editingExpense._id}`, formData);
                showSuccess('Expense updated successfully');
            } else {
                await api.post('/expenses', formData);
                showSuccess('Expense added successfully');
            }
            fetchExpenses();
            closeModal();
        } catch (error) {
            console.error('Error saving expense:', error);
            showError(error.response?.data?.message || 'Error saving expense');
        }
    };

    const handleDelete = (id) => {
        showConfirm(
            'Are you sure you want to delete this expense record?',
            async () => {
                try {
                    await api.delete(`/expenses/${id}`);
                    fetchExpenses();
                    showSuccess('Expense record deleted');
                } catch (error) {
                    showError('Failed to delete expense');
                }
            },
            'Delete Expense',
            'Delete'
        );
    };

    const openModal = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: new Date(expense.date).toISOString().split('T')[0],
                description: expense.description || '',
                paymentMethod: expense.paymentMethod
            });
        } else {
            setEditingExpense(null);
            setFormData({
                title: '',
                amount: '',
                category: 'Raw Materials',
                date: new Date().toISOString().split('T')[0],
                description: '',
                paymentMethod: 'cash'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="animate-fadeIn p-2 md:p-6 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-[900] text-gray-900 mb-2 flex items-center gap-3">
                        <TrendingDown className="w-8 h-8 text-red-500" />
                        Expense Management
                    </h2>
                    <p className="text-gray-500 font-medium">Track and manage your restaurant operational costs</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-500/50 outline-none transition-all font-medium"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-500/50 outline-none transition-all font-bold text-gray-700"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                            <ArrowDownRight className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Selected Expense</p>
                            <h3 className="text-3xl font-black text-gray-900">₹{totalExpense.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                {/* Could add more stats here like Monthly Total, Category breakdown, etc. */}
            </div>

            {/* Expenses List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-xl font-bold text-gray-900">Fetching records...</p>
                </div>
            ) : filteredExpenses.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-50 p-24 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Expense Records</h3>
                    <p className="text-gray-500 font-medium mb-8">Start tracking your business costs by adding your first expense</p>
                    <button
                        onClick={() => openModal()}
                        className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Expense
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Expense Item</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Payment</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{exp.title}</p>
                                                <p className="text-sm text-gray-500 font-medium truncate max-w-[200px]">{exp.description || 'No description'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-black uppercase tracking-wider">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-600 font-bold">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="capitalize text-gray-600 font-bold">{exp.paymentMethod}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xl font-black text-red-600">₹{exp.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openModal(exp)}
                                                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exp._id)}
                                                    className="p-2.5 bg-gray-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
                        {/* Modal Header */}
                        <div className="bg-black p-10 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-[900] mb-1">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Expenditure Record</p>
                            </div>
                            <button onClick={closeModal} className="relative z-10 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-95">
                                <X className="w-6 h-6" />
                            </button>
                            {/* Decorative background circle */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Expense Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Monthly Rent, Vegetable Purchase"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-red-600 text-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-700"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Payment Mode</label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold text-gray-700"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online / UPI</option>
                                        <option value="card">Credit/Debit Card</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Notes (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Add any additional details..."
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-[1.25rem] outline-none transition-all font-bold resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-orange-500 text-white rounded-[1.25rem] font-black shadow-xl shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <CheckCircle className="w-6 h-6" />
                                {editingExpense ? 'Update Expense Record' : 'Confirm & Add Expense'}
                            </button>
                        </form>
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

export default ExpenseManagement;
