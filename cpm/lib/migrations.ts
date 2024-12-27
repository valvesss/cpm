import pool from './db';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        players TEXT[] NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hands (
        id SERIAL PRIMARY KEY,
        session_id UUID REFERENCES sessions(id),
        actions JSONB NOT NULL,
        scores JSONB NOT NULL,
        transactions JSONB NOT NULL
      );
    `);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    client.release();
  }
}

