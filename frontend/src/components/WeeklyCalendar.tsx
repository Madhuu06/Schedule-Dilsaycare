import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, parseISO } from 'date-fns';
import { slotService } from '../services/api';
import { WeekSlotsResponse, Slot } from '../types/slot';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import SlotCard from './SlotCard';
import SlotModal from './SlotModal';

const WeeklyCalendar: React.FC = () => {
  const currentWeek = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []); // 0 = Sunday
  const [weeks, setWeeks] = useState<Date[]>([
    currentWeek,
    addWeeks(currentWeek, 1),
    addWeeks(currentWeek, 2)
  ]);
  const [allWeekSlots, setAllWeekSlots] = useState<{ [weekKey: string]: WeekSlotsResponse }>({});
  const [loading, setLoading] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const loadedWeeks = useRef<Set<string>>(new Set());

  const loadWeekSlots = useCallback(async (week: Date) => {
    const weekStart = format(week, 'yyyy-MM-dd');
    const weekKey = weekStart;
    
    // Avoid duplicate API calls
    if (loadedWeeks.current.has(weekKey)) {
      return;
    }
    
    setLoading(true);
    loadedWeeks.current.add(weekKey);
    
    try {
      const slots = await slotService.getWeekSlots(weekStart);
      setAllWeekSlots(prev => ({
        ...prev,
        [weekKey]: slots
      }));
    } catch (error) {
      console.error('Failed to load slots:', error);
      loadedWeeks.current.delete(weekKey); // Remove on error so it can be retried
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreWeeks = useCallback(async () => {
    console.log('Loading more weeks... Current count:', weeks.length);
    setWeeks(prev => {
      const nextWeek = addWeeks(prev[prev.length - 1], 1);
      console.log('Adding week:', format(nextWeek, 'MMM dd, yyyy'));
      loadWeekSlots(nextWeek);
      return [...prev, nextWeek];
    });
  }, [loadWeekSlots, weeks.length]);

  const [isFetching] = useInfiniteScroll(loadMoreWeeks, 500); // Increased threshold

  useEffect(() => {
    // Load initial weeks only once
    const initialWeeks = [
      currentWeek,
      addWeeks(currentWeek, 1),
      addWeeks(currentWeek, 2)
    ];
    initialWeeks.forEach(week => {
      loadWeekSlots(week);
    });
  }, [currentWeek, loadWeekSlots]);

  const reloadWeek = useCallback(async (week: Date) => {
    const weekStart = format(week, 'yyyy-MM-dd');
    const weekKey = weekStart;
    const slots = await slotService.getWeekSlots(weekStart);
    setAllWeekSlots(prev => ({
      ...prev,
      [weekKey]: slots
    }));
  }, []);

  const handleAddSlot = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setIsModalOpen(true);
  }, []);

  const handleEditSlot = useCallback((slot: Slot, date: string) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setIsModalOpen(true);
  }, []);

  const handleDeleteSlot = useCallback(async (slot: Slot, date: string) => {
    if (deletingSlotId === slot.id) return; // Prevent multiple simultaneous deletes of the same slot
    
    setDeletingSlotId(slot.id);
    try {
      // Always create an exception for the specific date to preserve recurring pattern
      await slotService.deleteSlot(slot.id, date);
      
      const slotDate = parseISO(date);
      const weekToReload = startOfWeek(slotDate, { weekStartsOn: 0 });
      await reloadWeek(weekToReload);
    } catch (error) {
      console.error('Failed to delete slot:', error);
    } finally {
      setDeletingSlotId(null);
    }
  }, [reloadWeek, deletingSlotId]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedDate('');
  }, []);

  const handleSlotSaved = useCallback(async () => {
    const slotDate = parseISO(selectedDate);
    const weekToReload = startOfWeek(slotDate, { weekStartsOn: 0 });
    await reloadWeek(weekToReload);
    handleModalClose();
  }, [selectedDate, reloadWeek, handleModalClose]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-gray-800 mb-1">
          Weekly Scheduler
        </h1>
        <p className="text-xs text-gray-500">Create recurring slots • Max 2 slots per day</p>
      </div>

      <div className="space-y-6">
        {weeks.map((week, weekIndex) => {
          const weekStart = format(week, 'yyyy-MM-dd');
          const weekSlots = allWeekSlots[weekStart] || {};
          const weekDays = Array.from({ length: 7 }, (_, i) => addDays(week, i));

          return (
            <div key={weekStart} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700 text-center">
                  {format(week, 'MMM dd')} - {format(addDays(week, 6), 'MMM dd, yyyy')}
                </h2>
              </div>
              
              <div className="grid grid-cols-7 divide-x divide-gray-200">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const daySlots = weekSlots[dateStr] || [];
                  
                  return (
                    <div key={dateStr} className="p-3 min-h-32 bg-white hover:bg-gray-50">
                      <div className="text-center mb-2">
                        <div className="text-xs font-medium text-gray-600">{format(day, 'EEE')}</div>
                        <div className="text-xs text-gray-500">{format(day, 'dd')}</div>
                      </div>
                      
                      {daySlots.length < 2 && (
                        <button
                          onClick={() => handleAddSlot(dateStr)}
                          className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mb-2 transition-colors"
                        >
                          Add
                        </button>
                      )}
                      
                      <div className="space-y-1">
                        {daySlots.map((slot) => (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            date={dateStr}
                            onEdit={handleEditSlot}
                            onDelete={handleDeleteSlot}
                            disabled={deletingSlotId === slot.id || loading}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {(loading || isFetching) && (
        <div className="flex justify-center items-center py-4 bg-gray-50 rounded border border-gray-200">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading more weeks...</span>
        </div>
      )}

      {/* Infinite scroll trigger area */}
      <div className="h-96"></div>

      {isModalOpen && (
        <SlotModal
          slot={selectedSlot}
          date={selectedDate}
          onClose={handleModalClose}
          onSave={handleSlotSaved}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;