import { startOfWeek, endOfWeek, format, addWeeks, addDays, parseISO } from 'date-fns';
import { SlotModel } from '../models/slot';
import { Slot, CreateSlotRequest, UpdateSlotRequest, WeekSlotsResponse } from '../types/slot';

export class SlotService {
  static async createSlot(slotData: CreateSlotRequest): Promise<Slot> {
    // Check how many active slots exist for this day of week by simulating a week check
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    
    // Find a date that matches the target day of week in the current or next week
    let targetDate = currentWeekStart;
    while (targetDate.getDay() !== slotData.day_of_week) {
      targetDate = addDays(targetDate, 1);
    }
    
    const weekSlots = await this.getWeekSlots(format(currentWeekStart, 'yyyy-MM-dd'));
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    const activeSlotsForDay = weekSlots[targetDateStr] || [];
    
    if (activeSlotsForDay.length >= 2) {
      throw new Error('Maximum 2 slots allowed per day');
    }

    return SlotModel.create(slotData);
  }

  static async getWeekSlots(weekStartDate: string): Promise<WeekSlotsResponse> {
    const startDate = startOfWeek(parseISO(weekStartDate), { weekStartsOn: 0 }); // 0 = Sunday
    const endDate = endOfWeek(startDate, { weekStartsOn: 0 });
    
    const slots = await SlotModel.findByWeek(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );

    const weekSlots: WeekSlotsResponse = {};
    
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();
      
      weekSlots[dateStr] = this.getSlotsForDate(slots, dayOfWeek, dateStr);
    }

    return weekSlots;
  }

  static async updateSlot(id: string, exceptionDate: string, updateData: UpdateSlotRequest): Promise<Slot> {
    // Check if we're updating an existing exception slot
    const existingSlot = await SlotModel.findById(id);
    if (existingSlot && existingSlot.is_exception) {
      // If it's already an exception slot, update it directly
      return SlotModel.update(id, updateData);
    }
    
    // Otherwise, create an exception for this specific date
    return SlotModel.updateAsException(id, exceptionDate, updateData);
  }

  static async deleteSlot(id: string, exceptionDate?: string): Promise<void> {
    // First check if this is an exception slot itself
    const slot = await SlotModel.findById(id);
    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.is_exception) {
      // This is already an exception slot, delete it directly
      await SlotModel.delete(id);
    } else if (exceptionDate) {
      // This is a recurring slot, create a delete exception for the specific date
      // This preserves the recurring pattern for all other dates
      await SlotModel.deleteAsException(id, exceptionDate);
    } else {
      // Only delete the entire recurring slot if no specific date is provided
      // This should rarely happen in the UI, but allows for full slot deletion
      await SlotModel.delete(id);
    }
  }

  private static getSlotsForDate(slots: Slot[], dayOfWeek: number, date: string): Slot[] {
    const recurringSlots = slots.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      !slot.is_exception
    );

    const exceptionSlots = slots.filter(slot => {
      if (!slot.is_exception || !slot.exception_date) return false;
      
      // Convert exception_date to string format for comparison
      const exceptionDateStr = format(new Date(slot.exception_date), 'yyyy-MM-dd');
      return exceptionDateStr === date;
    });
    
    const exceptions = new Set(
      exceptionSlots
        .filter(slot => slot.original_slot_id)
        .map(slot => slot.original_slot_id)
    );

    const validRecurringSlots = recurringSlots.filter(slot => 
      !exceptions.has(slot.id)
    );

    const validExceptionSlots = exceptionSlots.filter(slot => 
      !slot.is_deleted
    );

    return [...validRecurringSlots, ...validExceptionSlots];
  }

  private static async getSlotsByDay(dayOfWeek: number): Promise<Slot[]> {
    const today = new Date();
    const startDate = format(startOfWeek(today), 'yyyy-MM-dd');
    const endDate = format(endOfWeek(today), 'yyyy-MM-dd');
    
    const slots = await SlotModel.findByWeek(startDate, endDate);
    return slots.filter(slot => slot.day_of_week === dayOfWeek);
  }

  private static async getActiveRecurringSlotsForDay(dayOfWeek: number): Promise<Slot[]> {
    return await SlotModel.findRecurringSlotsByDay(dayOfWeek);
  }
}