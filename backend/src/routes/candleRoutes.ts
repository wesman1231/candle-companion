import express from 'express';
import { getCandles } from '../controllers/candleController.js';
import { getRandomCandle } from '../controllers/randomCandleController.js';

const router = express.Router();

router.get('/', getCandles)

router.get('/random', getRandomCandle);


export default router