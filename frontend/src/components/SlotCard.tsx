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
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
            {slot.start_time} - {slot.end_time}
          </div>
          {slot.title && (
            <div className="text-xs text-gray-600 mt-2">{slot.title}</div>
          )}
          {slot.is_exception && (
            <div className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded mt-2 inline-block">
              Modified
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => !disabled && onEdit(slot, date)}
            disabled={disabled}
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              disabled 
                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                : 'text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-300'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => !disabled && onDelete(slot, date)}
            disabled={disabled}
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              disabled 
                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                : 'text-red-600 hover:bg-red-600 hover:text-white border border-red-300'
            }`}
          >
            Delete
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