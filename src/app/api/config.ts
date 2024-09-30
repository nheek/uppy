import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config();

// Create a PostgreSQL pool using environment variables
export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});