import db from '../database/connection';
import { Slot, CreateSlotRequest, UpdateSlotRequest } from '../types/slot';

export class SlotModel {
  static async create(slotData: CreateSlotRequest): Promise<Slot> {
    const [slot] = await db('slots')
      .insert(slotData)
      .returning('*');
    return slot;
  }

  static async findById(id: string): Promise<Slot | null> {
    const slot = await db('slots')
      .where({ id })
      .first();
    return slot || null;
  }

  static async findByWeek(startDate: string, endDate: string): Promise<Slot[]> {
    const result = await db('slots')
      .where(function() {
        // Get all non-exception (recurring) slots that are not deleted
        this.where('is_exception', false)
          .andWhere('is_deleted', false)
          // Plus any exception slots (including deleted ones) for this specific week
          .orWhere(function() {
            this.where('is_exception', true)
              .andWhere('exception_date', '>=', startDate)
              .andWhere('exception_date', '<=', endDate);
          });
      })
      .orderBy(['day_of_week', 'start_time']);
      
    return result;
  }

  static async updateAsException(id: string, exceptionDate: string, updateData: Partial<UpdateSlotRequest>): Promise<Slot> {
    const originalSlot = await this.findById(id);
    if (!originalSlot) throw new Error('Slot not found');

    const [newSlot] = await db('slots')
      .insert({
        ...originalSlot,
        id: undefined,
        original_slot_id: originalSlot.original_slot_id || originalSlot.id,
        is_exception: true,
        exception_date: exceptionDate,
        ...updateData,
        created_at: undefined,
        updated_at: undefined
      })
      .returning('*');
    
    return newSlot;
  }

  static async deleteAsException(id: string, exceptionDate: string): Promise<void> {
    const originalSlot = await this.findById(id);
    if (!originalSlot) {
      throw new Error('Slot not found');
    }
    
    const exceptionRecord = {
      ...originalSlot,
      id: undefined,
      original_slot_id: originalSlot.original_slot_id || originalSlot.id,
      is_exception: true,
      exception_date: exceptionDate,
      is_deleted: true,
      created_at: undefined,
      updated_at: undefined
    };

    await db('slots').insert(exceptionRecord);
  }

  static async update(id: string, updateData: Partial<UpdateSlotRequest>): Promise<Slot> {
    const [updatedSlot] = await db('slots')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    if (!updatedSlot) {
      throw new Error('Slot not found');
    }
    
    return updatedSlot;
  }

  static async delete(id: string): Promise<void> {
    await db('slots')
      .where({ id })
      .del();
  }

  static async findRecurringSlotsByDay(dayOfWeek: number): Promise<Slot[]> {
    return await db('slots')
      .where({
        day_of_week: dayOfWeek,
        is_exception: false,
        is_deleted: false
      })
      .orderBy('start_time');
  }
}