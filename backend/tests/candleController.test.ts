import { db } from '../src/db/dbInstance';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { searchCandles, getCandleById } from '../src/controllers/candlesController';

const mockExecuteTakeFirst = vi.fn().mockResolvedValue({
    candle_id: '12345678-1234-5678-1234-567812345678',
    candle_name: 'Test Candle',
    candle_thumbnail: 'test-thumbnail.jpg',
    candle_brand: 'Test Brand',
    fragrances: [
        { fragrance_name: 'Vanilla', fragrance_id: '1' },
        { fragrance_name: 'Lavender', fragrance_id: '2' },
    ],
});

const mockdb = vi.spyOn(db, 'selectFrom').mockReturnValue({
    innerJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
    executeTakeFirst: mockExecuteTakeFirst
} as any)

const candleName = 'Test Candle'

//Additional tests will be added to test pagination logic and other features as they are implemented in the future.

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

    test('should call where with fragrance_note when fragrance notes are passed in, as well as groupBy and having', async () => {
        const notes = ['gourmand', 'floral'];
        const req = { query: { notes } } as unknown as Request;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        await searchCandles(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith(
            'f.fragrance_note',
            'in',
            notes,
        );

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


describe('getCandleById function tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return candle details when a valid candle ID is provided, and a 200 status code', async () => {
        const mockCandle = {
            candle_id: '12345678-1234-5678-1234-567812345678',
            candle_name: 'Test Candle',
            candle_thumbnail: 'test-thumbnail.jpg',
            candle_brand: 'Test Brand',
            fragrances: [
                { fragrance_name: 'Vanilla', fragrance_id: '1' },
                { fragrance_name: 'Lavender', fragrance_id: '2' },
            ],
        };

        const req = { params: { id: mockCandle.candle_id } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await getCandleById(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('c.candle_id', '=', mockCandle.candle_id);
        expect(query.executeTakeFirst).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ results: mockCandle });
    });

    test('Should return a 404 status code when an invalid candle ID is provided', async () => {
        const req = { params: { id: 'invalid-id' } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        mockExecuteTakeFirst.mockResolvedValueOnce(null);

        await getCandleById(req, res);

        const query = mockdb.mock.results[0]!.value;

        expect(query.where).toHaveBeenCalledWith('c.candle_id', '=', 'invalid-id');
        expect(query.executeTakeFirst).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: '404: Candle not found.' });
    });

    test('Should return a 400 status code when no candle ID is provided', async () => {
        const req = { params: { id: undefined } } as unknown as Request;
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;

        await getCandleById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: '400: Candle ID is required.' });
    });
});
