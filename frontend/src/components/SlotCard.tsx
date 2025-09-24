import React from 'react';
import { Slot } from '../types/slot';

interface SlotCardProps {
  slot: Slot;
  date: string;
  onEdit: (slot: Slot, date: string) => void;
  onDelete: (slot: Slot, date: string) => void;
  disabled?: boolean;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot, date, onEdit, onDelete, disabled = false }) => {
  return (
    <div className="bg-white border-b border-gray-100 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-gray-700 font-medium">
            {slot.start_time} - {slot.end_time}
          </div>
          {slot.title && (
            <div className="text-sm text-gray-500 mt-1">{slot.title}</div>
          )}
          {slot.is_exception && (
            <div className="text-xs text-orange-600 mt-1">Modified</div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => !disabled && onEdit(slot, date)}
            disabled={disabled}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            ✏️
          </button>
          <button
            onClick={() => !disabled && onDelete(slot, date)}
            disabled={disabled}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            🗑️
          </button>
        </div>
      </div>
      {slot.description && (
        <div className="text-xs text-purple-500 mt-2 bg-purple-50/80 p-2 rounded-md border border-purple-200/50">{slot.description}</div>
      )}
    </div>
  );
};

export default SlotCard;