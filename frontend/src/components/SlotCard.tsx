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
    <div className="bg-blue-50 border border-blue-200 rounded text-xs p-2 hover:bg-blue-100 transition-colors">
      <div className="font-medium text-gray-700 mb-1">
        {slot.start_time} - {slot.end_time}
      </div>
      {slot.title && (
        <div className="text-gray-600 mb-1">{slot.title}</div>
      )}
      {slot.description && (
        <div className="text-gray-500 mb-2">{slot.description}</div>
      )}
      {slot.is_exception && (
        <div className="text-orange-600 mb-1 text-xs">Modified</div>
      )}
      <div className="flex space-x-1">
        <button
          onClick={() => !disabled && onEdit(slot, date)}
          disabled={disabled}
          className={`text-xs px-1 py-0.5 rounded transition-colors ${
            disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-200'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => !disabled && onDelete(slot, date)}
          disabled={disabled}
          className={`text-xs px-1 py-0.5 rounded transition-colors ${
            disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-red-600 hover:bg-red-200'
          }`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SlotCard;