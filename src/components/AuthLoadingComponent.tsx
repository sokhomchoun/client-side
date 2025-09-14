import React from 'react';

interface AuthLoadingComponentProps {
    isActive: boolean;
}

export function AuthLoadingComponent({ isActive }: AuthLoadingComponentProps) {
    if (!isActive) return null;

    return (
        <div className="fixed top-0 left-0 z-50 w-screen h-screen flex justify-center items-center bg-[rgba(255,255,255,0.46)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );
};
