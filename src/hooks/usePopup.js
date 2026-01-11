import { useState } from 'react';

const usePopup = () => {
    const [popupState, setPopupState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    });

    const showPopup = ({ title = '', message, type = 'info', onConfirm, confirmText = 'OK', cancelText = 'Cancel' }) => {
        setPopupState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            confirmText,
            cancelText
        });
    };

    const closePopup = () => {
        setPopupState(prev => ({ ...prev, isOpen: false }));
    };

    // Convenience methods
    const showSuccess = (message, title = 'Success') => {
        showPopup({ title, message, type: 'success' });
    };

    const showError = (message, title = 'Error') => {
        showPopup({ title, message, type: 'error' });
    };

    const showWarning = (message, title = 'Warning') => {
        showPopup({ title, message, type: 'warning' });
    };

    const showInfo = (message, title = 'Information') => {
        showPopup({ title, message, type: 'info' });
    };

    const showConfirm = (message, onConfirm, title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel') => {
        showPopup({ title, message, type: 'confirm', onConfirm, confirmText, cancelText });
    };

    return {
        popupState,
        showPopup,
        closePopup,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm
    };
};

export default usePopup;
