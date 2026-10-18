import { Router } from 'express';
import { searchCandles } from '../controllers/candlesController';

const router = Router();

router.get('/candles', searchCandles);

export default router;