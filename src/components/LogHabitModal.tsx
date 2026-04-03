import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Habit } from '../types';
import { format } from 'date-fns';

interface Props {
  habit: Habit;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogHabitModal({ habit, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [timeSpent, setTimeSpent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    let imageUrl = null;

    if (habit.type === 'proof' && imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('proofs')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setLoading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);
      imageUrl = publicUrl;
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    const { error: logError } = await supabase.from('logs').insert({
      user_id: user.id,
      habit_id: habit.id,
      time_spent: parseInt(timeSpent, 10),
      image_url: imageUrl,
      date: today
    });

    if (logError) {
      alert(logError.message);
      setLoading(false);
      return;
    }

    // Update streak logic
    const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
    
    if (stats) {
      const lastLogDate = stats.last_log_date;
      let newStreak = stats.current_streak;
      
      if (lastLogDate) {
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        if (lastLogDate === yesterday) {
          newStreak += 1;
        } else if (lastLogDate !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await supabase.from('user_stats').update({
        current_streak: newStreak,
        last_log_date: today
      }).eq('user_id', user.id);
    } else {
      await supabase.from('user_stats').insert({
        user_id: user.id,
        current_streak: 1,
        last_log_date: today
      });
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Log: {habit.name}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Spent (minutes)</label>
            <input
              type="number"
              required
              min="1"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="e.g., 30"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          
          {habit.type === 'proof' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proof Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors relative overflow-hidden">
                {imagePreview ? (
                  <div className="absolute inset-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Click to change</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-gray-900 hover:text-gray-700 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" accept="image/*" required className="sr-only" onChange={handleImageChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !timeSpent || (habit.type === 'proof' && !imageFile)}
            className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Saving...' : 'Log Habit'}
          </button>
        </form>
      </div>
    </div>
  );
}
