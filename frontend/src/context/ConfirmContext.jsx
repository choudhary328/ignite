import React, { createContext, useState, useCallback, useContext } from 'react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        resolve: null,
    });

    const confirm = useCallback((message, title = 'Confirm Action') => {
        return new Promise((resolve) => {
            setConfig({
                isOpen: true,
                title,
                message,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        config.resolve(true);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        config.resolve(false);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmContext.Provider value={{ confirm, config, handleConfirm, handleCancel }}>
            {children}
        </ConfirmContext.Provider>
    );
};
