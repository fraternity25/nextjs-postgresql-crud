import { Pool } from 'pg';
const pool = new Pool(); // uses PGHOST etc. from .env.local
export default pool;