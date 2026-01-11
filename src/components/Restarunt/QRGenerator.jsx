import React, { useState, useEffect, useRef } from 'react';
import {
    QrCode,
    Download,
    Plus,
    Trash2,
    Eye,
    Copy,
    CheckCircle,
    Loader2,
    AlertCircle,
    X
} from 'lucide-react';
import api from '../config/api';
import Popup from '../common/Popup';
import usePopup from '../../hooks/usePopup';

const QRGenerator = () => {
    const [tables, setTables] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('4');
    const [previewTable, setPreviewTable] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [feedbackQR, setFeedbackQR] = useState(null);
    const { popupState, closePopup, showConfirm, showError } = usePopup();
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await api.get('/tables');
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Failed to load tables');
        } finally {
            setIsLoading(false);
        }
    };

    const addTable = async () => {
        if (!tableNumber.trim()) {
            setError('Please enter a table number');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await api.post('/tables', {
                tableNumber: tableNumber.trim(),
                capacity: parseInt(capacity) || 4,
                baseUrl: window.location.origin
            });

            if (response.data.success) {
                setTables([response.data.data, ...tables]);
                setTableNumber('');
                setCapacity('4');
            }
        } catch (error) {
            console.error('Error adding table:', error);
            setError(error.response?.data?.message || 'Failed to add table');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteTable = (id) => {
        showConfirm(
            'This will permanently remove the table and its QR code. This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/tables/${id}`);
                    setTables(tables.filter(t => t._id !== id));
                } catch (error) {
                    console.error('Error deleting table:', error);
                    showError('Failed to delete table');
                }
            },
            'Delete Table',
            'Delete',
            'Cancel'
        );
    };

    const downloadQRCode = (table) => {
        // Create a temporary link to download the QR code
        const link = document.createElement('a');
        link.download = `table-${table.tableNumber}-qr.png`;
        link.href = table.qrCode;
        link.click();
    };

    const copyURL = (table) => {
        navigator.clipboard.writeText(table.menuUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const previewQR = (table) => {
        setPreviewTable(table);
    };

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">QR Code Generator</h2>
                    <p className="text-gray-500 font-medium">Generate and manage QR codes for your restaurant tables</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold">{error}</p>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Add Table Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-orange-500" /> Add New Table
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Table number (e.g., A1, 01)"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTable()}
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                            disabled={isSaving}
                        />
                        <input
                            type="number"
                            placeholder="Capacity"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="1"
                            className="sm:w-32 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white focus:ring-4 focus:ring-orange-500/5 rounded-2xl outline-none transition-all font-bold"
                            disabled={isSaving}
                        />
                        <button
                            onClick={addTable}
                            disabled={isSaving}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black shadow-lg hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            {isSaving ? 'Adding...' : 'Add Table'}
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 shadow-xl shadow-indigo-100 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                            <QrCode className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black mb-2">Global Feedback QR</h3>
                        <p className="text-indigo-100 text-xs font-medium mb-6 px-4">Generate one QR code for all tables to collect customer feedback</p>

                        {!feedbackQR ? (
                            <button
                                onClick={async () => {
                                    try {
                                        setIsLoading(true);
                                        const res = await api.get(`/feedback/generate-qr?baseUrl=${window.location.origin}`);
                                        if (res.data.success) {
                                            setFeedbackQR(res.data.data);
                                        }
                                    } catch (error) {
                                        showError('Failed to generate Feedback QR');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Generate FeedBack QR
                            </button>
                        ) : (
                            <div className="w-full space-y-4">
                                <div className="bg-white rounded-2xl p-4 flex items-center justify-center shadow-inner">
                                    <img src={feedbackQR.qrCode} alt="Feedback QR" className="w-32 h-32" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.download = 'feedback-qr.png';
                                            link.href = feedbackQR.qrCode;
                                            link.click();
                                        }}
                                        className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(feedbackQR.feedbackUrl);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="flex-1 py-3 bg-white text-indigo-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Done' : 'Link'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <p className="text-xl font-bold text-gray-900">Loading tables...</p>
                </div>
            ) : tables.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 p-24 text-center">
                    <QrCode className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Tables Added</h3>
                    <p className="text-gray-500 font-medium">Add your first table to generate a QR code</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table) => (
                        <div key={table._id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900">Table {table.tableNumber}</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Capacity: {table.capacity} • {new Date(table.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteTable(table._id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* QR Code Preview */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 flex items-center justify-center aspect-square">
                                <img src={table.qrCode} alt={`QR Code for Table ${table.tableNumber}`} className="w-full h-full object-contain" />
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => previewQR(table)}
                                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                                <button
                                    onClick={() => downloadQRCode(table)}
                                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={() => copyURL(table)}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy URL'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewTable && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setPreviewTable(null)}>
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">Table {previewTable.tableNumber}</h3>
                        <p className="text-sm text-gray-500 font-semibold text-center mb-6">
                            Scan this QR code to view the menu
                        </p>
                        <div className="bg-gray-50 rounded-2xl p-8 mb-6 flex items-center justify-center">
                            <img src={previewTable.qrCode} alt="QR Code" className="w-full max-w-xs" />
                        </div>
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Menu URL:</p>
                            <p className="text-sm text-blue-600 font-semibold break-all">{previewTable.menuUrl}</p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => downloadQRCode(previewTable)}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download QR Code
                            </button>
                            <button
                                onClick={() => setPreviewTable(null)}
                                className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                Close
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

export default QRGenerator;
