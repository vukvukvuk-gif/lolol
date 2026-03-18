
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { config } from 'dotenv';

config(); // Load .env file

const connectionString = (import.meta && import.meta.env && import.meta.env.DATABASE_URL) || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
