import { useEffect, useState } from 'react';
import type { LangType } from '../types';
import { applyTheme, getNextTheme, readStoredTheme, storeTheme, type ThemeMode } from '../services/themeStore';

export const useUIState = () => {
    // --- STATE ---
    const [lang, setLang] = useState<LangType>('zh');
    const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
    const [devMode, setDevMode] = useState(false);
    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'success' | 'error' | 'info' }[]>([]);

    const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000); // Auto close
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Confirmation
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);

    const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirm = () => setConfirmDialog(null);

    // Persistence
    useEffect(() => {
        applyTheme(theme);

        const savedDevMode = localStorage.getItem('onepaper-devmode');
        if (savedDevMode === 'true') setDevMode(true);
    }, [theme]);

    useEffect(() => {
        storeTheme(theme);
    }, [theme]);

    // Actions
    const toggleTheme = () => {
        setTheme(prev => {
            const next = getNextTheme(prev);
            storeTheme(next);
            return next;
        });
    };
    const toggleDevMode = () => { setDevMode(!devMode); localStorage.setItem('onepaper-devmode', String(!devMode)); };

    return {
        // State
        lang, theme, devMode, isProjectManagerOpen, isGalleryOpen,
        notifications, confirmDialog,

        // Actions
        setLang, toggleTheme, toggleDevMode, setIsProjectManagerOpen, setIsGalleryOpen,
        addNotification, removeNotification,
        requestConfirm, closeConfirm
    };
};
