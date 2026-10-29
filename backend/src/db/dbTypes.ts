import type{
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'
import type { UUID } from 'node:crypto'
import type { StringDecoder } from 'node:string_decoder'

export interface Database {
  candles: CandleTable,
  fragrances: FragranceTable,
  candles_fragrances: CandleFragranceTable
}

export interface CandleTable {
  candle_id: string
  candle_name: string
  candle_thumbnail: string
  candle_brand: string
  candle_url: string
}

export interface FragranceTable {
  fragrance_id: string
  fragrance_name: string
  fragrance_note: string
}

export interface CandleFragranceTable {
  candle_id: string
  fragrance_id: string
}

export type Candle = Selectable<CandleTable>
export type Fragrance = Selectable<FragranceTable>
export type CandleFragrance = Selectable<CandleFragranceTable>