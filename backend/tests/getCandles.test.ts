import { jest } from "@jest/globals";
import type { CandleQuery } from '../src/controllers/candleController.js';
import type { Request, Response } from "express";

let mockReq: Partial<Request>;
let mockRes: Partial<Response>;

const mockExecute = jest.fn<() => Promise<any[]>>();

const mockBuildGetQuery = jest.fn(() => ({
  execute: mockExecute,
}));

const mockGenerateCacheKey = jest.fn<(query: any) => string>();
const mockReadFromCache = jest.fn<(key: string) => Promise<any | null>>();
const mockAddToCache = jest.fn<(key: string, data: any) => void>();

jest.unstable_mockModule(
  "../src/controllers/controllerUtils/buildGetQuery.js",
  () => ({ buildGetQuery: mockBuildGetQuery }),
);

jest.unstable_mockModule(
  "../src/controllers/controllerUtils/generateCacheKey.js",
  () => ({ generateCacheKey: mockGenerateCacheKey }),
);

jest.unstable_mockModule(
  "../src/controllers/controllerUtils/readQueryFromCache.js",
  () => ({ readFromCache: mockReadFromCache }),
);

jest.unstable_mockModule(
  "../src/controllers/controllerUtils/addQueryToCache.js",
  () => ({ addToCache: mockAddToCache }),
);

const { getCandles } = await import("../src/controllers/candleController.js");

beforeEach(() => {
  jest.clearAllMocks();

  mockGenerateCacheKey.mockReturnValue("mocked-cache-key");
  mockReadFromCache.mockResolvedValue(null); // Default to cache miss
  mockExecute.mockResolvedValue([{ id: 1, name: "default candle" }]); // Non-empty array passes .length check

  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
});

describe("tests candle retrieval from db", () => {
  
  // =========================================================================
  // DIRECT DATABASE TESTS, CACHE TESTING FURTHER DOWN
  // =========================================================================
  
  test("should return 200 status when candle name is provided", async () => {
    mockReq = {
      body: {
        candleQuery: {
          candle: { candleName: "floral drift" },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockGenerateCacheKey).toHaveBeenCalledWith(mockReq.body.candleQuery.candle);
    expect(mockReadFromCache).toHaveBeenCalledWith("mocked-cache-key");
    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when candle style is provided", async () => {
    mockReq = {
      body: {
        candleQuery: {
          candle: { candleStyle: "jar" },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when fragrances are provided", async () => {
    mockReq = {
      body: {
        candleQuery: {
          candle: { fragrances: ["vanilla", "clove"] },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when all candle paramaters are provided", async () => {
    mockReq = {
      body: {
        candleQuery: {
          candle: {
            candleName: "floral drift",
            candleStyle: "jar",
            fragrances: ["vanilla", "clove"],
          },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 400 if candle style is not valid", async () => {
    mockReq = {
      body: {
        candleQuery: {
          candle: { candleStyle: "invalid style" },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockGenerateCacheKey).not.toHaveBeenCalled();
    expect(mockBuildGetQuery).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  // =========================================================================
  // CACHE SPECIFIC SCENARIOS
  // =========================================================================

  test("should query the database and status 200 when cache misses", async () => {
    mockReadFromCache.mockResolvedValueOnce(null);
    const mockDbData = [{ id: 1, name: "floral drift", candle_style: "jar" }];
    mockExecute.mockResolvedValueOnce(mockDbData);

    mockReq = {
      body: {
        candleQuery: {
          candle: { candleName: "floral drift" },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockReadFromCache).toHaveBeenCalledWith("mocked-cache-key");
    expect(mockBuildGetQuery).toHaveBeenCalled(); 
    expect(mockExecute).toHaveBeenCalled();
    expect(mockAddToCache).toHaveBeenCalledWith("mocked-cache-key", mockDbData); 
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ result: mockDbData });
  });

  test("should short-circuit, skip database query, and return data when cache hits", async () => {
    const fakeCachedData = { result: [{ id: 123, name: "cached floral drift" }] };
    mockReadFromCache.mockResolvedValueOnce(fakeCachedData);

    mockReq = {
      body: {
        candleQuery: {
          candle: { candleName: "floral drift" },
          page: 1,
          limit: 10,
        },
      },
    };

    await getCandles(mockReq as Request, mockRes as Response);

    expect(mockReadFromCache).toHaveBeenCalledWith("mocked-cache-key");
    
    expect(mockBuildGetQuery).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockAddToCache).not.toHaveBeenCalled();
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(fakeCachedData);
  });
});