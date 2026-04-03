export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: 'proof' | 'non-proof';
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  time_spent: number;
  image_url?: string;
  date: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  current_streak: number;
  last_log_date: string | null;
}
