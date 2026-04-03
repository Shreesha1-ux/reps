import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Habit, HabitLog } from '../types';
import { format } from 'date-fns';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { LogHabitModal } from '../components/LogHabitModal';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logModalHabit, setLogModalHabit] = useState<Habit | null>(null);
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

  const handleHabitClick = (habit: Habit) => {
    const isLogged = todayLogs.some(log => log.habit_id === habit.id);
    if (!isLogged) {
      setLogModalHabit(habit);
    }
  };

  const onHabitCreated = () => {
    fetchData();
    setIsCreateModalOpen(false);
  };

  const onHabitLogged = () => {
    fetchData();
    setLogModalHabit(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }

  // Calculate day number since first habit
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
                  <button
                    key={habit.id}
                    onClick={() => handleHabitClick(habit)}
                    disabled={isLogged}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border text-left transition-all min-h-[64px]",
                      isLogged 
                        ? "bg-gray-50 border-gray-100 opacity-60 cursor-default" 
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
                    )}
                  >
                    <div>
                      <h3 className={cn("font-medium", isLogged ? "text-gray-500 line-through" : "text-gray-900")}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                        {habit.type === 'proof' ? 'Proof Required' : 'Time Based'}
                      </p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      isLogged ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300 text-transparent"
                    )}>
                      <Check size={14} />
                    </div>
                  </button>
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
    </div>
  );
}
