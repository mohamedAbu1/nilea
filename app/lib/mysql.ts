import "server-only";

import mysql, { type Pool, type PoolConnection } from "mysql2/promise";

let pool: Pool | null = null;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Configure the MySQL connection in the server environment.`);
  return value;
}

export function getMysqlPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: required("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: required("MYSQL_USER"),
    password: process.env.MYSQL_PASSWORD ?? "",
    database: required("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 8),
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "Z",
    ssl: process.env.MYSQL_SSL === "true" ? {} : undefined,
  });
  return pool;
}

export async function query<T = unknown[]>(sql: string, values: unknown[] = []) {
  const [rows] = await getMysqlPool().execute(sql, values as never[]);
  return rows as T;
}

export async function withTransaction<T>(callback: (connection: PoolConnection) => Promise<T>) {
  const connection = await getMysqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function asMysqlError(error: unknown) {
  if (error instanceof Error) return error;
  return new Error("MySQL request failed.");
}
