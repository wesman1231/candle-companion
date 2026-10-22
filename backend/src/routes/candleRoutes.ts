import { Router } from 'express';
import { searchCandles, getCandleById } from '../controllers/candlesController';

const router = Router();

router.get('/candles', searchCandles);
router.get('/candles/:id', getCandleById);

export default router;