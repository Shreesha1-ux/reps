import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Habit, HabitLog } from '../types';
import { format } from 'date-fns';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { LogHabitModal } from '../components/LogHabitModal';
import { HabitCard } from '../components/HabitCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HabitDetailModal } from '../components/HabitDetailModal';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logModalHabit, setLogModalHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitForDetails, setHabitForDetails] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    if (!user) return;
    
    const [habitsRes, logsRes, statsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('logs').select('*').eq('user_id', user.id).eq('date', today),
      supabase.from('user_stats').select('*').eq('user_id', user.id).single()
    ]);

    if (habitsRes.data) setHabits(habitsRes.data);
    if (logsRes.data) setTodayLogs(logsRes.data);
    if (statsRes.data) setStreak(statsRes.data.current_streak);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onHabitCreated = () => {
    fetchData();
    setIsCreateModalOpen(false);
    showToast("Habit created! Time to get to work 🚀");
  };

  const onHabitLogged = () => {
    fetchData();
    setLogModalHabit(null);
    showToast("Habit completed! Keep the streak going 🔥");
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;
    setIsDeleting(true);
    
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitToDelete.id);

    if (error) {
      alert("Failed to delete habit: " + error.message);
    } else {
      setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
      showToast("Habit deleted successfully");
    }
    
    setIsDeleting(false);
    setHabitToDelete(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }

  const firstHabitDate = habits.length > 0 ? new Date(habits[0].created_at) : new Date();
  const dayDiff = Math.floor((new Date().getTime() - firstHabitDate.getTime()) / (1000 * 3600 * 24)) + 1;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">DAY {dayDiff}</h1>
          <p className="text-gray-500 italic">"No excuses. Just reps."</p>
        </header>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Daily Habits</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors min-h-[44px]"
            >
              <Plus size={16} />
              <span>Start a Habit</span>
            </button>
          </div>

          <div className="grid gap-3">
            {habits.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                <p className="text-gray-500">No habits yet. Start building your streak today.</p>
              </div>
            ) : (
              habits.map(habit => {
                const isLogged = todayLogs.some(log => log.habit_id === habit.id);
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isLogged={isLogged}
                    onLog={() => setLogModalHabit(habit)}
                    onDelete={() => setHabitToDelete(habit)}
                    onShowDetails={() => setHabitForDetails(habit)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center sticky top-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Current Streak</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#111827"
                strokeWidth="8"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * Math.min(streak, 30)) / 30}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-900">{streak}</span>
              <span className="block text-sm text-gray-500 mt-1">days</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            {streak === 0 ? "Start your streak today!" : "Keep the momentum going."}
          </p>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateHabitModal onClose={() => setIsCreateModalOpen(false)} onSuccess={onHabitCreated} />
      )}

      {logModalHabit && (
        <LogHabitModal habit={logModalHabit} onClose={() => setLogModalHabit(null)} onSuccess={onHabitLogged} />
      )}

      <ConfirmDialog
        isOpen={!!habitToDelete}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? This will also remove all its history.`}
        onConfirm={handleDeleteHabit}
        onCancel={() => setHabitToDelete(null)}
        isLoading={isDeleting}
      />

      {habitForDetails && (
        <HabitDetailModal
          habit={habitForDetails}
          onClose={() => setHabitForDetails(null)}
        />
      )}
    </div>
  );
}
