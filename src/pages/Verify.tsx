import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function Verify() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Email Verified</h1>
        <p className="text-gray-500 mb-8">
          Email verified successfully. You can now log in to your account.
        </p>
        <Link
          to="/login"
          className="inline-flex justify-center items-center w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
