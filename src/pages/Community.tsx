import React from 'react';
import { Construction } from 'lucide-react';

export function Community() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="bg-gray-100 p-4 rounded-full">
        <Construction size={48} className="text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Under Construction</h1>
      <p className="text-gray-500 max-w-md">
        We're building a space for you to connect with others, share your streaks, and stay accountable together. Check back soon!
      </p>
    </div>
  );
}
