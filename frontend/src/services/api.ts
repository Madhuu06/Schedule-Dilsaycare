import axios from 'axios';
import { Slot, CreateSlotRequest, UpdateSlotRequest, WeekSlotsResponse } from '../types/slot';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const slotService = {
  async createSlot(slotData: CreateSlotRequest): Promise<Slot> {
    const response = await api.post('/slots', slotData);
    return response.data;
  },

  async getWeekSlots(weekStart: string): Promise<WeekSlotsResponse> {
    const response = await api.get(`/slots/week?weekStart=${weekStart}`);
    return response.data;
  },

  async updateSlot(id: string, updateData: UpdateSlotRequest): Promise<Slot> {
    const response = await api.put(`/slots/${id}`, updateData);
    return response.data;
  },

  async deleteSlot(id: string, exceptionDate?: string): Promise<void> {
    const url = exceptionDate 
      ? `/slots/${id}?exception_date=${exceptionDate}`
      : `/slots/${id}`;
    await api.delete(url);
  },
};