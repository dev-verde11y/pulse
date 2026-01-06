'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            containerStyle={{
                zIndex: 99999,
            }}
            toastOptions={{
                className: 'z-[99999]',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                },
            }}
        />
    );
}
