import type{
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'
import type { UUID } from 'node:crypto'

export interface Database {
  candles: CandleTable,
  fragrances: FragranceTable,
  candles_fragrances: CandleFragranceTable
}

export interface CandleTable {
  candle_id: Generated<UUID>
  candle_name: string
  candle_brand: string
}

export interface FragranceTable {
  fragrance_id: Generated<UUID>
  fragrance_name: string
}

export interface CandleFragranceTable {
  candle_id: UUID
  fragrance_id: UUID
}

export type Candle = Selectable<CandleTable>
export type Fragrance = Selectable<FragranceTable>
export type CandleFragrance = Selectable<CandleFragranceTable>