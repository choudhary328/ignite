import React from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { RiAlertLine } from 'react-icons/ri';
import './ConfirmDialog.css';

const ConfirmDialog = () => {
    const { config, handleConfirm, handleCancel } = useConfirm();

    if (!config.isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={handleCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon-wrapper">
                    <RiAlertLine className="confirm-icon" />
                </div>
                <div className="confirm-content">
                    <h3 className="confirm-title">{config.title}</h3>
                    <p className="confirm-message">{config.message}</p>
                </div>
                <div className="confirm-actions">
                    <button className="confirm-btn-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="confirm-btn-confirm" onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
