import type { PoolConfig } from "pg";

/** Build TLS policy explicitly; pg URL ssl parameters otherwise override it. */
export function databaseConfig(connectionString: string, env: Record<string, string | undefined> = process.env): PoolConfig {
  const url = new URL(connectionString);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  const insecure = env.DATABASE_TLS_INSECURE === "true";
  // pg-connection-string lets these URL parameters replace the ssl object.
  // Keep the policy in one place, including when a provider supplies sslmode=require.
  for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat"]) {
    url.searchParams.delete(key);
  }
  return {
    connectionString: url.toString(),
    ssl: local ? false : {
      rejectUnauthorized: !insecure,
      ...(env.DATABASE_TLS_CA ? { ca: env.DATABASE_TLS_CA } : {}),
    },
  };
}
