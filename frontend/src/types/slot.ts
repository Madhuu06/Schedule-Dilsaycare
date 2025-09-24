export interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  original_slot_id?: string;
  is_exception: boolean;
  exception_date?: string;
  is_deleted: boolean;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSlotRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  title?: string;
  description?: string;
}

export interface UpdateSlotRequest {
  start_time?: string;
  end_time?: string;
  title?: string;
  description?: string;
  exception_date: string;
}

export interface WeekSlotsResponse {
  [date: string]: Slot[];
}