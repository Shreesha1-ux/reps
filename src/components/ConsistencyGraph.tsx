import React from 'react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';

interface Props {
  logs: { date: string }[];
  days?: number;
}

export function ConsistencyGraph({ logs, days = 30 }: Props) {
  const today = startOfDay(new Date());
  const gridDays = Array.from({ length: days }).map((_, i) => subDays(today, days - 1 - i));

  const logDates = new Set(logs.map(log => format(startOfDay(new Date(log.date)), 'yyyy-MM-dd')));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>{format(gridDays[0], 'MMM d')}</span>
        <span>Today</span>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-1">
        {gridDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCompleted = logDates.has(dateStr);
          
          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
              className={cn(
                "w-3.5 h-3.5 rounded-sm transition-colors cursor-help",
                isCompleted 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-gray-100 hover:bg-gray-200"
              )}
            />
          );
        })}
      </div>
      <div className="flex items-center space-x-2 text-[10px] text-gray-400 justify-end px-1">
        <span>Less</span>
        <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm" />
        <div className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
        <span>More</span>
      </div>
    </div>
  );
}
