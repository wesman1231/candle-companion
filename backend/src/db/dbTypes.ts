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
  candle: CandleTable,
  fragrance: FragranceTable,
  candle_fragrance: CandleFragranceTable
}

export interface CandleTable {
  id: Generated<UUID>
  name: string
  brand: string
}

export interface FragranceTable {
  id: Generated<UUID>
  name: string
}

export interface CandleFragranceTable {
  candle_id: UUID
  fragrance_id: UUID
}

export type Candle = Selectable<CandleTable>
export type Fragrance = Selectable<FragranceTable>
export type CandleFragrance = Selectable<CandleFragranceTable>