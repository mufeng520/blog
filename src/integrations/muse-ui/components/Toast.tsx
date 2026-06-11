import React, { useEffect, useState } from 'react';
import IconLoader from './IconLoader';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
    notifications: ToastMessage[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-md items-center">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className={`
                        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-top-2 fade-in
                        ${n.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : ''}
                        ${n.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' : ''}
                        ${n.type === 'info' ? 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200' : ''}
                    `}
                >
                    {n.type === 'success' && <IconLoader name="check" size={16} className="text-green-600 dark:text-green-400" />}
                    {n.type === 'error' && <IconLoader name="x" size={16} className="text-red-600 dark:text-red-400" />}
                    {n.type === 'info' && <IconLoader name="info" size={16} className="text-teal-600 dark:text-teal-400" />}

                    <span className="text-sm font-medium flex-1">{n.message}</span>

                    <button onClick={() => onClose(n.id)} className="ml-2 hover:opacity-70 p-1">
                        <IconLoader name="x" size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

interface ConfirmationProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    lang: 'zh' | 'en';
}

export const ConfirmationDialog: React.FC<ConfirmationProps> = ({ isOpen, title, message, onConfirm, onCancel, lang }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onMouseDown={onCancel}>
            <div
                className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-6 w-96 transform scale-100 animate-in zoom-in-95 border border-stone-200 dark:border-stone-700"
                onMouseDown={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 shrink-0">
                        {/* We can use the 'info' icon for generic queries, or specific alert icon. Let's use info or maybe add alert icon? We have 'info'. */}
                        <IconLoader name="info" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2 leading-none mt-1">{title}</h3>
                        <p className="text-stone-600 dark:text-stone-400 text-sm">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-medium transition-colors text-sm"
                    >
                        {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        autoFocus
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-lg shadow-red-500/30 transition-all hover:scale-105 text-sm"
                    >
                        {lang === 'zh' ? '确认' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
