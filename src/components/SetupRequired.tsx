import React from 'react';

export function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Setup Required</h1>
        <p className="text-gray-600 mb-6">
          I've configured your Supabase Project URL. Now, please add your Supabase Anon Key to the <strong>Secrets menu</strong> (the lock icon) to continue.
        </p>
        <div className="text-left bg-gray-50 p-4 rounded-lg text-sm text-gray-800 font-mono overflow-x-auto">
          <p>VITE_SUPABASE_ANON_KEY=your_anon_key</p>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          You can find this in your Supabase Dashboard under Project Settings &gt; API.
        </p>
      </div>
    </div>
  );
}
