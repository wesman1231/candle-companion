import type { CandleStyle } from './candleStyle.js';

export type CandleQuery = {
    candleName?: string;
    candleStyle?: CandleStyle;
    fragrances?: string[];
    limit?: number;
    page?: number;
}