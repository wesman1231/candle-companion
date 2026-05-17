import type {
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely'

/**
 * UUID alias
 */
export type UUID = string

/**
 * ENUMS
 */
export type CandleStyle =
  | 'Jar'
  | 'Large Tumbler'
  | 'Small Tumbler'
  | 'Three-Wick'
  | 'Mini'

/**
 * TABLES
 */

export interface CandlesTable {
  candle_id: Generated<UUID>
  candle_name: string
  candle_style: CandleStyle
  candle_description: string | null
  candle_brand: string | null
}

export interface FragrancesTable {
  fragrance_id: Generated<UUID>
  fragrance_name: string
}

export interface CandlesFragrancesTable {
  candle_id: UUID
  fragrance_id: UUID
}

/**
 * DATABASE
 */

export interface Database {
  candles: CandlesTable
  fragrances: FragrancesTable
  candles_fragrances: CandlesFragrancesTable
}