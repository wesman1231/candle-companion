import { db } from '../src/db/dbInstance'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import { searchCandles } from '../src/controllers/candlesController'

const mockdb = vi.spyOn(db, 'selectFrom').mockReturnValue({
    innerJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
} as any)

const candleName = 'Test Candle'

describe('Candle search query should be modified based on what filters are passed in', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should call where with candle_name when name is passed in', async () => {
        const req = { query: { name: candleName } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('c.candle_name', '=', candleName);
        expect(query.execute).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should call where with candle_brand when brand is passed in', async () => {
        const brand = 'Test Brand';
        const req = { query: { brand } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('c.candle_brand', '=', brand);
        expect(query.execute).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should call where with fragrance_name when fragrance is passed in, as well as groupBy and having', async () => {
        const fragrances = ['Vanilla', 'Lavender'];
        const req = { query: { fragrances } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('f.fragrance_name', 'in', fragrances);
        expect(query.groupBy).toHaveBeenCalledWith([
            'c.candle_id',
            'c.candle_name',
            'c.candle_thumbnail',
            'c.candle_brand',
        ]);
        expect(query.having).toHaveBeenCalled();
        expect(query.execute).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should apply both name and brand filters when both are passed in', async () => {
        const req = { query: { name: 'Test Candle', brand: 'Test Brand' } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('c.candle_name', '=', 'Test Candle');

        expect(query.where).toHaveBeenCalledWith('c.candle_brand', '=', 'Test Brand');
        expect(query.execute).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should not apply fragrance filters when none are passed in', async () => {
        const req = { query: {} } as unknown as Request;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).not.toHaveBeenCalled();
        expect(query.groupBy).not.toHaveBeenCalled();
        expect(query.having).not.toHaveBeenCalled();
        expect(query.execute).toHaveBeenCalled();
    });
});
