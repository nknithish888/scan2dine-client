import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Popup = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'OK', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-16 h-16 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-16 h-16 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
            case 'confirm':
                return <AlertTriangle className="w-16 h-16 text-orange-500" />;
            default:
                return <Info className="w-16 h-16 text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    gradient: 'from-green-500 to-green-600',
                    button: 'from-green-500 to-green-600',
                    ring: 'ring-green-500/20'
                };
            case 'error':
                return {
                    gradient: 'from-red-500 to-red-600',
                    button: 'from-red-500 to-red-600',
                    ring: 'ring-red-500/20'
                };
            case 'warning':
                return {
                    gradient: 'from-yellow-500 to-yellow-600',
                    button: 'from-yellow-500 to-yellow-600',
                    ring: 'ring-yellow-500/20'
                };
            case 'confirm':
                return {
                    gradient: 'from-orange-500 to-orange-600',
                    button: 'from-orange-500 to-orange-600',
                    ring: 'ring-orange-500/20'
                };
            default:
                return {
                    gradient: 'from-blue-500 to-blue-600',
                    button: 'from-blue-500 to-blue-600',
                    ring: 'ring-blue-500/20'
                };
        }
    };

    const colors = getColors();
    const isConfirmDialog = type === 'confirm';

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${colors.gradient} p-8 text-white text-center`}>
                    <div className="flex justify-center mb-4">
                        {getIcon()}
                    </div>
                    {title && <h3 className="text-2xl font-black">{title}</h3>}
                </div>

                {/* Message Body */}
                <div className="p-8 text-center">
                    <p className="text-gray-700 text-lg font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className={`p-6 bg-gray-50 flex gap-3 ${isConfirmDialog ? 'justify-between' : 'justify-center'}`}>
                    {isConfirmDialog ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-6 py-3 bg-gradient-to-r ${colors.button} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCancel}
                            className={`px-8 py-3 bg-gradient-to-r ${colors.button} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all`}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Popup;
