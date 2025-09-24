import React, { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { slotService } from '../services/api';
import { Slot, CreateSlotRequest, UpdateSlotRequest } from '../types/slot';

interface SlotModalProps {
  slot: Slot | null;
  date: string;
  onClose: () => void;
  onSave: () => void;
}

const SlotModal: React.FC<SlotModalProps> = ({ slot, date, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (slot) {
      setFormData({
        start_time: slot.start_time,
        end_time: slot.end_time,
        title: slot.title || '',
        description: slot.description || ''
      });
    }
  }, [slot]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.start_time) {
      errors.start_time = 'Start time is required';
    }
    
    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    }
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      
      if (start >= end) {
        errors.end_time = 'End time must be after start time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (slot) {
        const updateData: UpdateSlotRequest = {
          ...formData,
          exception_date: date
        };
        await slotService.updateSlot(slot.id, updateData);
      } else {
        const createData: CreateSlotRequest = {
          ...formData,
          day_of_week: parseISO(date).getDay()
        };
        await slotService.createSlot(createData);
      }
      onSave();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-center text-purple-600">
          {slot ? 'Edit Slot' : 'Create New Slot'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  validationErrors.start_time ? 'border-red-300 bg-red-50' : 'border-purple-300 bg-white hover:border-purple-400'
                }`}
              />
              {validationErrors.start_time && (
                <p className="text-red-600 text-xs mt-1 font-medium">{validationErrors.start_time}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  validationErrors.end_time ? 'border-red-300 bg-red-50' : 'border-purple-300 bg-white hover:border-purple-400'
                }`}
              />
              {validationErrors.end_time && (
                <p className="text-red-600 text-xs mt-1 font-medium">{validationErrors.end_time}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              className="w-full border-2 border-purple-300 bg-white hover:border-purple-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full border-2 border-purple-300 bg-white hover:border-purple-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-purple-600 border-2 border-purple-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 font-medium transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
            >
              {loading ? 'Saving...' : (slot ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotModal;