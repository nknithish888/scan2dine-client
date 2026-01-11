import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Edit,
    Trash2,
    Search,
    DollarSign,
    Calendar,
    Phone,
    Mail,
    Briefcase,
    Clock,
    X,
    CheckCircle,
    Loader2
} from 'lucide-react';
import api from '../config/api';
import Popup from '../common/Popup';
import usePopup from '../../hooks/usePopup';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { popupState, closePopup, showError, showConfirm } = usePopup();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'waiter',
        shift: 'morning',
        salary: '',
        address: '',
        emergencyContact: '',
        password: '' // New field
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff');
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
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

        // Basic validation for manager password
        if (formData.role === 'manager' && !formData.password && !editingStaff) {
            showError('Password is required for Managers to enable system access');
            return;
        }

        try {
            if (editingStaff) {
                await api.put(`/staff/${editingStaff._id}`, formData);
            } else {
                await api.post('/staff', formData);
            }
            fetchStaff();
            closeModal();
        } catch (error) {
            console.error('Error saving staff:', error);
            showError(error.response?.data?.message || 'Error saving staff member');
        }
    };

    const handleDelete = (id) => {
        showConfirm(
            'Are you sure you want to remove this staff member? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/staff/${id}`);
                    fetchStaff();
                } catch (error) {
                    console.error('Error deleting staff:', error);
                    showError('Failed to delete staff member');
                }
            },
            'Delete Staff Member',
            'Delete',
            'Cancel'
        );
    };

    const openModal = (staffMember = null) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({
                name: staffMember.name,
                email: staffMember.email,
                phone: staffMember.phone,
                role: staffMember.role,
                shift: staffMember.shift,
                salary: staffMember.salary,
                address: staffMember.address || '',
                emergencyContact: staffMember.emergencyContact || '',
                password: '' // Clear password on edit
            });
        } else {
            setEditingStaff(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'waiter',
                shift: 'morning',
                salary: '',
                address: '',
                emergencyContact: '',
                password: '' // Default empty
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const getRoleColor = (role) => {
        const colors = {
            waiter: 'bg-blue-100 text-blue-700',
            chef: 'bg-red-100 text-red-700',
            manager: 'bg-purple-100 text-purple-700',
            cashier: 'bg-green-100 text-green-700'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            'on-leave': 'bg-yellow-100 text-yellow-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredStaff = staff.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">Staff Management</h2>
                    <p className="text-gray-500 font-medium">Manage your restaurant team</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-medium text-gray-700"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black shadow-lg hover:shadow-orange-500/40 transition-all whitespace-nowrap"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Staff
                    </button>
                </div>
            </div>

            {/* Staff Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-xl font-bold text-gray-900">Loading staff...</p>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 p-24 text-center">
                    <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Staff Members</h3>
                    <p className="text-gray-500 font-medium mb-8">Start building your team by adding staff members</p>
                    <button
                        onClick={() => openModal()}
                        className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-orange-600 transition-all inline-flex items-center gap-3"
                    >
                        <UserPlus className="w-6 h-6" />
                        Add First Staff Member
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((member) => (
                        <div key={member._id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <h4 className="text-xl font-black text-gray-900 mb-1">{member.name}</h4>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${getRoleColor(member.role)}`}>
                                        {member.role}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(member)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 font-medium">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 font-medium">{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 font-medium capitalize">{member.shift} Shift</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 font-bold">₹{member.salary}/month</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(member.status)}`}>
                                    {member.status}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    Joined {new Date(member.joinedDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                    {editingStaff ? <Edit className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                                    <p className="text-orange-100 font-medium">Enter staff details below</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-3 rounded-2xl bg-white/10 hover:bg-white/30 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Salary (₹/month)</label>
                                    <input
                                        type="number"
                                        name="salary"
                                        required
                                        value={formData.salary}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    >
                                        <option value="waiter">Waiter</option>
                                        <option value="chef">Chef</option>
                                        <option value="manager">Manager</option>
                                        <option value="cashier">Cashier</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Shift</label>
                                    <select
                                        name="shift"
                                        value={formData.shift}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                    >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                    </select>
                                </div>
                            </div>

                            {/* Password Section - Manager specific */}
                            {(formData.role === 'manager' || !editingStaff) && (
                                <div className={`p-6 rounded-3xl border-2 transition-all ${formData.role === 'manager' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">
                                            {formData.role === 'manager' ? '🔑 Manager Password' : 'Login Password (Optional)'}
                                        </label>
                                        {formData.role === 'manager' && (
                                            <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase">Credentials will be emailed</span>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder={formData.role === 'manager' ? "Required for dashboard access" : "Leave blank to skip portal access"}
                                        required={formData.role === 'manager' && !editingStaff}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-white border-2 border-transparent focus:border-orange-500/30 rounded-2xl outline-none transition-all font-bold"
                                    />
                                    {formData.role === 'manager' && (
                                        <p className="mt-2 text-xs text-orange-600 font-bold italic">Managers can log in with their email and this password.</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Emergency Contact</label>
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black shadow-xl hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle className="w-6 h-6" />
                                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
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

export default StaffManagement;
