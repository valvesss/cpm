import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

neonConfig.fetchConnectionCache = true;

let pool: Pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export default pool;

