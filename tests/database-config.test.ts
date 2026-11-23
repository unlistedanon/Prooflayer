import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { databaseConfig } from "../lib/database-config";

test("remote TLS verifies certificates even with misleading localhost text and URL flags", () => {
  for (const url of [
    "postgresql://user:localhost@db.example/app",
    "postgresql://user:pass@db.example/localhost?sslmode=no-verify",
    "postgresql://user:pass@db.example/app?sslmode=require&ssl=false&sslrootcert=bad",
  ]) {
    const config = databaseConfig(url, {});
    const client = new Client(config);
    assert.deepEqual(client.ssl, { rejectUnauthorized: true });
  }
});
test("local databases avoid TLS; disabling remote verification requires explicit opt-out", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    assert.equal(databaseConfig(`postgresql://user:pass@${host}/app`, {}).ssl, false);
  }
  assert.deepEqual(databaseConfig("postgresql://user:pass@db.example/app", {
    DATABASE_TLS_INSECURE: "true", DATABASE_TLS_CA: "custom-ca"
  }).ssl, { rejectUnauthorized: false, ca: "custom-ca" });
  assert.deepEqual(databaseConfig("postgresql://user:pass@db.example/app", {
    DATABASE_TLS_INSECURE: "1"
  }).ssl, { rejectUnauthorized: true });
});
