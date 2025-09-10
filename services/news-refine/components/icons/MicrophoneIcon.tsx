import React from 'react';

// FIX: Accept a className prop to allow for flexible styling. This resolves type errors in consuming components.
export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17a1 1 0 11-2 0v-2.07A5 5 0 015 10V8a1 1 0 012 0v2a3 3 0 006 0V8a1 1 0 012 0v2a5 5 0 01-4 4.93z" clipRule="evenodd" />
    </svg>
);