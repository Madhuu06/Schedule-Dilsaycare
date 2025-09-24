import { Router } from 'express';
import { SlotController } from '../controllers/slotController';

const router = Router();

router.post('/slots', SlotController.createSlot);
router.get('/slots/week', SlotController.getWeekSlots);
router.put('/slots/:id', SlotController.updateSlot);
router.delete('/slots/:id', SlotController.deleteSlot);

export default router;