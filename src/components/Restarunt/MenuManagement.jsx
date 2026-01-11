import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    UtensilsCrossed,
    Loader2,
    X,
    Star,
    Sparkles,
    CheckCircle2,
    Layers,
    Power,
    AlertCircle,
    Camera,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import api from '../config/api';
import Popup from '../common/Popup';
import usePopup from '../../hooks/usePopup';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [comboItemInput, setComboItemInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const { popupState, closePopup, showConfirm, showError } = usePopup();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Breakfast Specials',
        isVegetarian: false,
        isCombo: false,
        isAvailable: true,
        savingAmount: '',
        comboItems: [],
        image: ''
    });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await api.get('/menu');
            if (response.data.success) {
                setMenuItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addComboItem = () => {
        if (comboItemInput.trim()) {
            setFormData({
                ...formData,
                comboItems: [...formData.comboItems, comboItemInput.trim()]
            });
            setComboItemInput('');
        }
    };

    const removeComboItem = (index) => {
        const updatedItems = formData.comboItems.filter((_, i) => i !== index);
        setFormData({ ...formData, comboItems: updatedItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaveLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'comboItems') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key] === null ? '' : formData[key]);
            }
        });

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingItem) {
                await api.put(`/menu/${editingItem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/menu', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchMenu();
            closeModal();
        } catch (error) {
            console.error('Error saving menu item:', error);
            setError(error.response?.data?.message || 'Failed to save menu item. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = (id) => {
        showConfirm(
            'This will permanently remove this item from your menu. Are you sure you want to continue?',
            async () => {
                try {
                    await api.delete(`/menu/${id}`);
                    fetchMenu();
                } catch (error) {
                    console.error('Error deleting item:', error);
                    showError('Failed to delete menu item');
                }
            },
            'Delete Menu Item',
            'Delete',
            'Cancel'
        );
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                isVegetarian: item.isVegetarian,
                isCombo: item.isCombo || false,
                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                savingAmount: item.savingAmount || '',
                comboItems: item.comboItems || [],
                image: item.image || ''
            });
            setImagePreview(item.image);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Breakfast Specials',
                isVegetarian: false,
                isCombo: false,
                isAvailable: true,
                savingAmount: '',
                comboItems: [],
                image: ''
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setComboItemInput('');
        setImageFile(null);
        setImagePreview(null);
        setError(null);
    };

    const toggleAvailability = async (item) => {
        try {
            await api.put(`/menu/${item._id}`, { ...item, isAvailable: !item.isAvailable });
            fetchMenu();
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="animate-fadeIn">
                    <h2 className="text-3xl font-black text-gray-900 mb-1">Menu Management</h2>
                    <p className="text-gray-500 font-medium">Design and curate your restaurant's offerings</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/ transition-all font-medium text-gray-700"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {isLoading ? (
                    <div className="col-span-full py-32 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                            <UtensilsCrossed className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">Preparing your menu...</p>
                        <p className="text-gray-400 mt-2">Just a moment while we fetch your culinary delights</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 p-24 text-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
                            <UtensilsCrossed className="w-12 h-12 text-orange-500" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-3">Your Menu is Empty</h3>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Let's create something delicious! Start by adding your first signature dish or a value combo.</p>
                        <button
                            onClick={() => openModal()}
                            className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-black transition-all inline-flex items-center gap-3 shadow-xl hover:-translate-y-1"
                        >
                            <Plus className="w-6 h-6" /> Create My First Item
                        </button>
                    </div>
                ) : filteredItems.map((item) => (
                    <div key={item._id} className={`bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col relative translate-y-0 hover:-translate-y-2 ${!item.isAvailable ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                        {/* Image Section */}
                        <div className="relative h-60 overflow-hidden">
                            <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />

                            {!item.isAvailable && (
                                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full">
                                        <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Currently Unavailable</span>
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                                {item.isCombo ? (
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-lg flex items-center gap-1.5 border border-indigo-400/30">
                                        <Sparkles className="w-3 h-3" /> Combo
                                    </span>
                                ) : (
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-lg border ${item.isVegetarian ? 'bg-green-500 text-white border-green-400/30' : 'bg-red-500 text-white border-red-400/30'
                                        }`}>
                                        {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                    </span>
                                )}
                                <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.1em] text-gray-800 shadow-lg border border-white/50">
                                    {item.category}
                                </span>
                            </div>

                            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => toggleAvailability(item)}
                                        className={`p-3 rounded-2xl shadow-xl transition-all transform hover:scale-110 ${item.isAvailable ? 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-orange-500 text-white hover:bg-white hover:text-orange-500'}`}
                                        title={item.isAvailable ? 'Deactivate Listing' : 'Activate Listing'}
                                    >
                                        <Power className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => openModal(item)} className="p-3 bg-white/95 backdrop-blur rounded-2xl text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-3 bg-white/95 backdrop-blur rounded-2xl text-red-600 shadow-xl hover:bg-red-600 hover:text-white transition-all transform hover:scale-110">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-gray-900 text-xl line-clamp-1 group-hover:text-orange-500 transition-colors">{item.name}</h4>
                                <div className="bg-orange-50 px-3 py-1 rounded-lg">
                                    <span className="font-black text-orange-600 text-lg">₹{item.price}</span>
                                </div>
                            </div>

                            <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-4 leading-relaxed">{item.description}</p>

                            {item.isCombo && item.comboItems && item.comboItems.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-3 h-3" /> Includes:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.comboItems.map((ci, i) => (
                                            <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold border border-indigo-100">
                                                {ci}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">(New)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${item.isAvailable ? 'text-gray-400' : 'text-red-500'}`}>
                                        {item.isAvailable ? 'In Stock' : 'Currently Unavailable'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - BRAND NEW DESIGN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-black/80 via-orange-900/20 to-black/80 backdrop-blur-lg animate-fadeIn overflow-y-auto">
                    <div className="relative w-full max-w-5xl bg-gradient-to-br from-white to-gray-50 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-scaleIn my-auto max-h-[95vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 hover:text-red-600 transition-all group"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>

                        {/* Header - Sleek Design */}
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500"></div>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTE2IDBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNi0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

                            <div className="relative px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 sm:gap-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex items-center justify-center border-2 border-white/30">
                                            {formData.isCombo ?
                                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" /> :
                                                <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                                            }
                                        </div>
                                        <div className="text-white">
                                            <h2 className="text-xl sm:text-2xl lg:text-4xl font-black mb-1">
                                                {editingItem ? 'Edit Menu Item' : 'Add New Dish'}
                                            </h2>
                                            <p className="text-orange-100 font-semibold text-sm sm:text-base lg:text-lg">
                                                {formData.isCombo ? 'Create combo deal' : 'Add item to menu'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Type Toggle */}
                                    <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isCombo: false })}
                                            className={`flex-1 lg:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl lg:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${!formData.isCombo
                                                ? 'bg-white text-orange-600 shadow-lg scale-105'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline">Single Dish</span>
                                            <span className="sm:hidden">Dish</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isCombo: true })}
                                            className={`flex-1 lg:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl lg:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${formData.isCombo
                                                ? 'bg-white text-indigo-600 shadow-lg scale-105'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                            Combo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body - Modern Grid Layout */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-12">
                            {error && (
                                <div className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4 text-red-700 animate-shake shadow-lg">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-base sm:text-lg">Oops! Something went wrong</p>
                                        <p className="text-xs sm:text-sm font-semibold mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                                {/* LEFT COLUMN - Visual Content */}
                                <div className="space-y-8">
                                    {/* Image Upload - Enhanced */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                <Camera className="w-5 h-5 text-orange-500" />
                                                Dish Photo
                                            </label>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Required</span>
                                        </div>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative group cursor-pointer"
                                        >
                                            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-dashed border-gray-200 rounded-3xl overflow-hidden group-hover:border-orange-400 group-hover:shadow-2xl transition-all">
                                                {imagePreview ? (
                                                    <>
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                            <Upload className="w-12 h-12 text-white mb-2" />
                                                            <p className="text-white font-bold">Click to change</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                            <ImageIcon className="w-10 h-10 text-orange-600" />
                                                        </div>
                                                        <p className="text-xl font-black text-gray-700 mb-2">Upload Dish Photo</p>
                                                        <p className="text-sm text-gray-500 font-semibold text-center">
                                                            JPG, PNG, WEBP • Max 10MB<br />
                                                            Click or drag to upload
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>

                                        {/* URL Alternative */}
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="image"
                                                value={formData.image && !imageFile ? formData.image : ''}
                                                onChange={handleInputChange}
                                                placeholder="Or paste image URL"
                                                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Availability Toggle - Redesigned */}
                                    <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-3xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-black text-gray-900 text-lg mb-1">Availability Status</p>
                                                <p className="text-sm font-semibold text-gray-600">
                                                    {formData.isAvailable ? 'Customers can order this item' : 'Hidden from menu'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                                                className={`relative w-20 h-10 rounded-full transition-all shadow-lg ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all flex items-center justify-center ${formData.isAvailable ? 'left-11' : 'left-1'
                                                    }`}>
                                                    {formData.isAvailable ?
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                                        <X className="w-5 h-5 text-gray-400" />
                                                    }
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN - Details */}
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-black text-gray-900">Dish Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Butter Chicken Masala"
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-bold text-xl text-gray-900 placeholder:text-gray-300"
                                        />
                                    </div>

                                    {/* Price & Category Row */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-lg font-black text-gray-900">Price</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-orange-600">
                                                    ₹
                                                </div>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    required
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    placeholder="299"
                                                    className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-black text-xl text-gray-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-lg font-black text-gray-900">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-bold text-gray-900 cursor-pointer appearance-none bg-[right_1.5rem_center] bg-no-repeat"
                                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23f97316\' stroke-width=\'3\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.5em' }}
                                            >
                                                <option>Breakfast Specials</option>
                                                <option>Dosa & Uttapam</option>
                                                <option>Starters & Appetizers</option>
                                                <option>Main Course Curries</option>
                                                <option>Meals & Thalis</option>
                                                <option>Biryani & Rice Varieties</option>
                                                <option>Breads & Parotta</option>
                                                <option>Desserts & Sweets</option>
                                                <option>Beverages & Coffee</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Saving Amount for Combos */}
                                    {formData.isCombo && (
                                        <div className="space-y-3">
                                            <label className="text-lg font-black text-indigo-600 flex items-center gap-2">
                                                <Sparkles className="w-5 h-5" /> Total Savings on Combo
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-600">
                                                    ₹
                                                </div>
                                                <input
                                                    type="number"
                                                    name="savingAmount"
                                                    value={formData.savingAmount}
                                                    onChange={handleInputChange}
                                                    placeholder="How much does the customer save? (e.g., 50)"
                                                    className="w-full pl-12 pr-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-black text-xl text-indigo-900"
                                                />
                                            </div>
                                            <p className="text-xs font-bold text-indigo-400 px-2 italic">Customers love seeing how much they save! This will be highlighted on the menu.</p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-black text-gray-900">Description</label>
                                        <textarea
                                            name="description"
                                            required
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Describe what makes this dish special..."
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300 resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Dietary Marker */}
                                    {!formData.isCombo && (
                                        <div className="space-y-3">
                                            <label className="text-lg font-black text-gray-900">Dietary Type</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isVegetarian: true })}
                                                    className={`px-6 py-4 rounded-2xl font-bold transition-all border-2 ${formData.isVegetarian
                                                        ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                                                        }`}
                                                >
                                                    🟢 Vegetarian
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isVegetarian: false })}
                                                    className={`px-6 py-4 rounded-2xl font-bold transition-all border-2 ${!formData.isVegetarian
                                                        ? 'bg-red-500 border-red-600 text-white shadow-lg scale-105'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                                                        }`}
                                                >
                                                    🔴 Non-Veg
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Combo Items Section */}
                            {formData.isCombo && (
                                <div className="mt-6 sm:mt-8 lg:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl sm:rounded-[2rem]">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">Combo Inclusions</h3>
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600">Select items for this combo</p>
                                        </div>
                                    </div>

                                    {/* Grid of existing items */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 max-h-64 overflow-y-auto pr-2">
                                        {menuItems.filter(item => !item.isCombo).map((item) => {
                                            const isSelected = formData.comboItems.includes(item.name);
                                            return (
                                                <button
                                                    key={item._id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setFormData({
                                                                ...formData,
                                                                comboItems: formData.comboItems.filter(i => i !== item.name)
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                comboItems: [...formData.comboItems, item.name]
                                                            });
                                                        }
                                                    }}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg'
                                                        : 'bg-white border-indigo-200 hover:border-indigo-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-5 h-5 rounded-lg ${isSelected ? 'bg-white' : 'bg-indigo-100'} flex items-center justify-center`}>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                                        </div>
                                                        <p className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                            {item.name}
                                                        </p>
                                                    </div>
                                                    <p className={`text-xs font-bold ${isSelected ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                        ₹{item.price}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom item input */}
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={comboItemInput}
                                            onChange={(e) => setComboItemInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComboItem())}
                                            placeholder="Add custom item (e.g., Extra Sauce)"
                                            className="flex-1 px-6 py-3 bg-white border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none font-semibold"
                                        />
                                        <button
                                            type="button"
                                            onClick={addComboItem}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Selected items */}
                                    {formData.comboItems.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {formData.comboItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-indigo-200">
                                                    <span className="font-bold text-indigo-700">{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeComboItem(idx)}
                                                        className="w-6 h-6 rounded-full bg-indigo-100 hover:bg-red-100 text-indigo-600 hover:text-red-600 flex items-center justify-center transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Button - Redesigned */}
                            <div className="mt-12 flex gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-5 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    className={`flex-[2] py-5 px-8 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${saveLoading
                                        ? 'bg-gray-400 text-white'
                                        : formData.isCombo
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                                        }`}
                                >
                                    {saveLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {formData.isCombo ? <Sparkles className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                            {editingItem ? 'Update Dish' : 'Add to Menu'}
                                        </>
                                    )}
                                </button>
                            </div>
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

export default MenuManagement;
