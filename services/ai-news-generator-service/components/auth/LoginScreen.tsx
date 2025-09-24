import React from 'react';

export const LoginScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 text-center">
        <h1 className="text-3xl font-bold text-cyan-400">AI News Gen</h1>
        <p className="mt-2 text-gray-300 text-lg">الوصول غير مسموح به</p>
        <p className="text-gray-400">
          يرجى تسجيل الدخول من خلال لوحة التحكم الرئيسية للوصول إلى هذه الأداة.
        </p>
      </div>
    </div>
  );
};