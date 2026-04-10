import React from 'react';
import { format, subDays, startOfDay, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '../lib/utils';

interface Props {
  logs: { date: string }[];
  days?: number;
}

export function ConsistencyGraph({ logs, days = 90 }: Props) {
  const today = startOfDay(new Date());
  // Align to the start of the week (Sunday) for the first day, and end of the week for the last day
  const endDate = endOfWeek(today);
  const startDate = startOfWeek(subDays(today, days - 1));

  const gridDays = eachDayOfInterval({ start: startDate, end: endDate });
  const logDates = new Set(logs.map(log => log.date));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
        <span>{format(startDate, 'MMM d')}</span>
        <span>Today</span>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-1 overflow-x-auto">
        {gridDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCompleted = logDates.has(dateStr);
          const isFuture = date > today;
          
          return (
            <div
              key={dateStr}
              title={`${format(date, 'MMM d, yyyy')}: ${isCompleted ? 'Completed' : isFuture ? 'Future' : 'Missed'}`}
              className={cn(
                "w-3 h-3 rounded-[2px] transition-colors cursor-help",
                isCompleted 
                  ? "bg-green-500 hover:bg-green-600" 
                  : isFuture 
                    ? "bg-gray-50 opacity-50"
                    : "bg-gray-100 hover:bg-gray-200"
              )}
            />
          );
        })}
      </div>
      <div className="flex items-center space-x-2 text-[10px] text-gray-400 justify-end px-1 font-medium">
        <span>Less</span>
        <div className="w-2.5 h-2.5 bg-gray-100 rounded-[2px]" />
        <div className="w-2.5 h-2.5 bg-green-500 rounded-[2px]" />
        <span>More</span>
      </div>
    </div>
  );
}

