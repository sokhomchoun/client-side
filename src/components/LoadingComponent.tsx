import React from 'react';

interface LoadingComponentProps {
    isActive: boolean;
}

export function LoadingComponent({ isActive }: LoadingComponentProps) {
    if (!isActive) return null;

    return (
        <div className="fixed top-0 left-0 z-50 w-screen h-screen flex justify-center items-center bg-[#051438]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );
};
