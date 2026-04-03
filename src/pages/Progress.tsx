import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Habit, HabitLog } from '../types';
import { format, parseISO } from 'date-fns';
import { Flame } from 'lucide-react';

export function Progress() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<(HabitLog & { habit: Habit })[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [logsRes, statsRes, habitsRes] = await Promise.all([
        supabase.from('logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        supabase.from('habits').select('*').eq('user_id', user.id)
      ]);

      if (logsRes.data && habitsRes.data) {
        const habitsMap = new Map(habitsRes.data.map(h => [h.id, h]));
        const enrichedLogs = logsRes.data.map(log => ({
          ...log,
          habit: habitsMap.get(log.habit_id) as Habit
        })).filter(log => log.habit);
        setLogs(enrichedLogs);
      }

      if (statsRes.data) {
        setStreak(statsRes.data.current_streak);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Progress</h1>
        <p className="text-gray-500">Track your journey and consistency.</p>
      </header>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-lg font-medium text-gray-300 mb-1">Current Streak</h2>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold">{streak}</span>
            <span className="text-gray-400">days</span>
          </div>
        </div>
        <div className="relative z-10 animate-bounce">
          <Flame size={64} className="text-orange-500 opacity-80 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        </div>
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Recent Logs</h3>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-xl">No logs yet.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{log.habit.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(parseISO(log.date), 'MMM d, yyyy')} • {log.time_spent} mins
                  </p>
                </div>
                {log.image_url && (
                  <div className="shrink-0">
                    <img 
                      src={log.image_url} 
                      alt="Proof" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
