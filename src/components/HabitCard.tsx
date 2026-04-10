import React from 'react';
import { Check, Trash2, ChevronRight } from 'lucide-react';
import { Habit } from '../types';
import { cn } from '../lib/utils';

interface Props {
  habit: Habit;
  isLogged: boolean;
  onLog: () => void;
  onDelete: () => void;
  onShowDetails: () => void;
}

export const HabitCard: React.FC<Props> = ({ habit, isLogged, onLog, onDelete, onShowDetails }) => {
  return (
    <div className="group relative">
      <div
        onClick={isLogged ? onShowDetails : onLog}
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border text-left transition-all min-h-[64px] relative z-10",
          isLogged 
            ? "bg-gray-50 border-gray-100 cursor-pointer hover:bg-gray-100" 
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
        )}
      >
        <div className="flex-1">
          <h3 className={cn("font-semibold transition-colors", isLogged ? "text-gray-400 line-through" : "text-gray-900")}>
            {habit.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              {habit.type === 'proof' ? 'Proof Required' : 'Time Based'}
            </p>
            {isLogged && (
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center">
                <ChevronRight size={10} className="mr-0.5" />
                Details
              </span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300",
          isLogged ? "bg-green-500 border-green-500 text-white scale-110" : "border-gray-300 text-transparent"
        )}>
          <Check size={14} strokeWidth={3} />
        </div>
      </div>

      {/* Delete button - only visible on hover on desktop, always visible on mobile if needed but here we keep it clean */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -right-2 -top-2 z-20 p-1.5 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
