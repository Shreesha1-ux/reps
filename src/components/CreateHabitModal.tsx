import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateHabitModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<'proof' | 'non-proof'>('non-proof');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name,
      type
    });

    setLoading(false);
    if (!error) {
      onSuccess();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Create Habit</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read 10 pages"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habit Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('non-proof')}
                className={`p-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                  type === 'non-proof' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Time Based
              </button>
              <button
                type="button"
                onClick={() => setType('proof')}
                className={`p-3 text-sm font-medium rounded-lg border text-center transition-colors ${
                  type === 'proof' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Proof Based
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {type === 'proof' ? 'Requires an image upload to complete.' : 'Only requires time spent.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Creating...' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
}
