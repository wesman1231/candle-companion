
import { vi } from 'vitest'
import type { UUID } from 'node:crypto'
import type {
  Candle,
  Fragrance,
  CandleFragrance,
} from '../db/dbTypes'

export const mockCandles: Candle[] = [
  {
    candle_id: '11111111-1111-4111-8111-111111111111' as UUID,
    candle_name: 'Vanilla Bean',
    candle_thumbnail: '/images/vanilla.jpg',
    candle_brand: 'Example Brand',
  },
]

export const mockFragrances: Fragrance[] = [
  {
    fragrance_id: '22222222-2222-4222-8222-222222222222' as UUID,
    fragrance_name: 'Vanilla',
  },
]

export const mockCandleFragrances: CandleFragrance[] = [
  {
    candle_id: mockCandles[0]!.candle_id,
    fragrance_id: mockFragrances[0]!.fragrance_id,
  },
]

type MockQuery = {
  selectAll: () => {
    execute: () => Promise<
      (Candle | Fragrance | CandleFragrance)[]
    >
  }
}

type MockDatabase = {
  selectFrom: (
    table: 'candles' | 'fragrances' | 'candles_fragrances'
  ) => MockQuery
}

export const mockDb: MockDatabase = {
  selectFrom: vi.fn((table) => ({
    selectAll: vi.fn(() => ({
      execute: vi.fn().mockResolvedValue(
        table === 'candles'
          ? mockCandles
          : table === 'fragrances'
            ? mockFragrances
            : mockCandleFragrances,
      ),
    })),
  })),
}
