import { Request, Response } from 'express';
import { SlotService } from '../services/slotService';

export class SlotController {
  static async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const slot = await SlotService.createSlot(req.body);
      res.status(201).json(slot);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getWeekSlots(req: Request, res: Response): Promise<void> {
    try {
      const { weekStart } = req.query;
      if (!weekStart || typeof weekStart !== 'string') {
        res.status(400).json({ error: 'weekStart parameter is required' });
        return;
      }
      
      const slots = await SlotService.getWeekSlots(weekStart);
      res.json(slots);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async updateSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { exception_date, ...updateData } = req.body;
      
      if (!exception_date) {
        res.status(400).json({ error: 'exception_date is required for updates' });
        return;
      }
      
      const slot = await SlotService.updateSlot(id, exception_date, updateData);
      res.json(slot);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { exception_date } = req.query;
      
      await SlotService.deleteSlot(id, exception_date as string);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}