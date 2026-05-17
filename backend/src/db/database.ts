import type { Database } from './schema.js'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import dotenv from 'dotenv'
dotenv.config()

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.DB_NAME,
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 10,
  })
});

export const db = new Kysely<Database>({
  dialect,
})