
import React from 'react';

interface LoaderProps {
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
            <p className="text-sm font-semibold text-gray-300">{message}</p>
        </div>
    );
};
