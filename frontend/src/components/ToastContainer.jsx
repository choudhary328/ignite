import React from 'react';
import { useToast } from '../context/ToastContext';
import {
    RiCheckboxCircleFill,
    RiErrorWarningFill,
    RiAlertFill,
    RiInformationFill,
    RiCloseLine,
} from 'react-icons/ri';
import './Toast.css';

const iconMap = {
    success: <RiCheckboxCircleFill />,
    error: <RiErrorWarningFill />,
    warning: <RiAlertFill />,
    info: <RiInformationFill />,
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">{iconMap[toast.type]}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        <RiCloseLine />
                    </button>
                    <div
                        className="toast-progress"
                        style={{ animationDuration: `${toast.duration}ms` }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
