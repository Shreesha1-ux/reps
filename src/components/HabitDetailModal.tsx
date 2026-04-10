import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Trophy, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Habit, HabitLog } from '../types';
import { ConsistencyGraph } from './ConsistencyGraph';
import { format, differenceInDays, parseISO } from 'date-fns';

interface Props {
  habit: Habit;
  onClose: () => void;
}

export function HabitDetailModal({ habit, onClose }: Props) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('habit_id', habit.id)
        .order('date', { ascending: false });

      if (data) {
        setLogs(data);
        calculateStats(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [habit.id]);

  const calculateStats = (history: HabitLog[]) => {
    if (history.length === 0) return;

    const sortedDates = [...new Set(history.map(l => l.date))].sort((a, b) => b.localeCompare(a));
    
    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    // Current streak
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      current = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = parseISO(sortedDates[i]);
        const d2 = parseISO(sortedDates[i+1]);
        if (differenceInDays(d1, d2) === 1) {
          current++;
        } else {
          break;
        }
      }
    }

    // Longest streak
    tempStreak = 1;
    longest = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = parseISO(sortedDates[i]);
      const d2 = parseISO(sortedDates[i+1]);
      if (differenceInDays(d1, d2) === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }
    longest = Math.max(longest, tempStreak);

    setStats({
      currentStreak: current,
      longestStreak: longest,
      totalCompletions: history.length
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{habit.name}</h2>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium">
              {habit.type === 'proof' ? 'Proof Based' : 'Time Based'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-2xl text-center">
              <Flame className="mx-auto text-orange-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-orange-900">{stats.currentStreak}</div>
              <div className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Current</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-2xl text-center">
              <Trophy className="mx-auto text-yellow-600 mb-2" size={24} />
              <div className="text-2xl font-bold text-yellow-900">{stats.longestStreak}</div>
              <div className="text-[10px] uppercase font-bold text-yellow-700 tracking-wider">Best</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-center">
              <Calendar className="mx-auto text-blue-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-blue-900">{stats.totalCompletions}</div>
              <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Total</div>
            </div>
          </div>

          {/* Consistency Graph */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Consistency</h3>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              {loading ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading history...</div>
              ) : (
                <ConsistencyGraph logs={logs} days={90} />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
