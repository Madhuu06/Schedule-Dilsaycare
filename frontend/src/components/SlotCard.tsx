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
    <div className="bg-white border border-gray-200 rounded p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">
            {slot.start_time} - {slot.end_time}
          </div>
          {slot.title && (
            <div className="text-xs text-gray-600 mt-1">{slot.title}</div>
          )}
          {slot.is_exception && (
            <div className="text-xs text-orange-600 mt-1">Modified</div>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => !disabled && onEdit(slot, date)}
            disabled={disabled}
            className={`text-xs px-2 py-1 rounded ${
              disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => !disabled && onDelete(slot, date)}
            disabled={disabled}
            className={`text-xs px-2 py-1 rounded ${
              disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-red-500 hover:text-red-600'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
      {slot.description && (
        <div className="text-xs text-gray-500 mt-1">{slot.description}</div>
      )}
    </div>
  );
};

export default SlotCard;