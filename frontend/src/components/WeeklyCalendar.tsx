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
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-purple-600">
            Weekly Scheduler
          </h1>
          <p className="text-gray-600 mt-2">Create recurring slots • Max 2 slots per day</p>
        </div>

        <div className="space-y-8">
          {weeks.map((week, weekIndex) => {
            const weekStart = format(week, 'yyyy-MM-dd');
            const weekSlots = allWeekSlots[weekStart] || {};
            const weekDays = Array.from({ length: 7 }, (_, i) => addDays(week, i));

            return (
              <div key={weekStart} className="border-b border-purple-200 pb-8 last:border-b-0">
                <h2 className="text-xl font-bold text-purple-700 mb-6 text-center">
                  {format(week, 'MMM dd')} - {format(addDays(week, 6), 'MMM dd, yyyy')}
                </h2>
                
                <div className="grid grid-cols-7 gap-4">
                  {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const daySlots = weekSlots[dateStr] || [];
                    
                    return (
                      <div key={dateStr} className="border-2 border-purple-200/50 rounded-xl p-4 bg-gradient-to-br from-white to-purple-50/30 hover:from-purple-50/50 hover:to-purple-100/30 min-h-40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 hover:border-purple-300/50">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="font-bold text-purple-700 text-lg">{format(day, 'EEE')}</h3>
                            <p className="text-sm text-purple-500 font-medium">{format(day, 'MMM dd')}</p>
                          </div>
                          {daySlots.length < 2 && (
                            <button
                              onClick={() => handleAddSlot(dateStr)}
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-bold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
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
          <div className="flex justify-center items-center py-8 bg-gradient-to-r from-purple-50 to-white rounded-xl mx-4 mb-4 border border-purple-200 shadow-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-purple-700 font-semibold">Loading more weeks...</span>
          </div>
        )}

        {/* Infinite scroll trigger area */}
        <div className="h-96"></div>
      </div>

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