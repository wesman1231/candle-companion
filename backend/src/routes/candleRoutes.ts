import { Router } from 'express';
import { getCandles } from '../controllers/candlesController';

const router = Router();

router.get('/candles', getCandles);

export default router;