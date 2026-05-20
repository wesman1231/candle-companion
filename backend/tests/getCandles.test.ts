import { jest } from "@jest/globals";
import type { Request, Response } from "express";

let mockReq: Partial<Request>;
let mockRes: Partial<Response>;

const mockExecute = jest.fn().mockReturnThis();

const mockBuildGetQuery = jest.fn(() => ({
  execute: mockExecute,
}));

jest.unstable_mockModule(
  "../src/controllers/controllerUtils/buildGetQuery.js",
  () => ({
    buildGetQuery: mockBuildGetQuery,
  }),
);

const { getCandles } = await import("../src/controllers/candleController.js");

beforeEach(() => {
  jest.clearAllMocks();

  mockReq = {
    body: {
      candleQuery: {
        page: 1,
        limit: 10,
      },
    },
  };

  mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
});

describe("tests candle retrieval from db", () => {
  test("should return 200 status when candle name is provided", async () => {
    ((mockReq = {
      body: {
        candleQuery: {
          candleName: "floral drift",
          page: 1,
          limit: 10,
        },
      },
    }),
      await getCandles(mockReq as Request, mockRes as Response));
    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when candle style is provided", async () => {
    ((mockReq = {
      body: {
        candleQuery: {
          candleStyle: "jar",
          page: 1,
          limit: 10,
        },
      },
    }),
      await getCandles(mockReq as Request, mockRes as Response));
    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when fragrances are provided", async () => {
    ((mockReq = {
      body: {
        candleQuery: {
          fragrances: ["vanilla", "clove"],
          page: 1,
          limit: 10,
        },
      },
    }),
    await getCandles(mockReq as Request, mockRes as Response));
    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 200 status when all candle paramaters are provided", async () => {
    ((mockReq = {
      body: {
        candleQuery: {
          candleName: "floral drift",
          candleStyle: "jar",
          fragrances: ["vanilla", "clove"],
          page: 1,
          limit: 10,
        },
      },
    }),
    await getCandles(mockReq as Request, mockRes as Response));
    expect(mockBuildGetQuery).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("should return 400 if candle style is not valid", async () => {
    ((mockReq = {
      body: {
        candleQuery: {
          candleStyle: "invalid style",
          page: 1,
          limit: 10,
        },
      },
    }),
    await getCandles(mockReq as Request, mockRes as Response));
    expect(mockBuildGetQuery).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
