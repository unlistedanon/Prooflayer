import { Pool, PoolClient } from "pg";
import { Receipt, ReceiptInput, hashReceipt, makeReceipt } from "./receipts";

declare global {
  // eslint-disable-next-line no-var
  var proofLayerMemory: Map<string, Receipt> | undefined;
  // eslint-disable-next-line no-var
  var proofLayerPool: Pool | undefined;
}

const memory = globalThis.proofLayerMemory ?? new Map<string, Receipt>();
globalThis.proofLayerMemory = memory;

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? (globalThis.proofLayerPool ?? new Pool({ connectionString: databaseUrl, ssl: databaseUrl.includes("localhost") ? undefined : { rejectUnauthorized: false } }))
  : null;
if (pool) globalThis.proofLayerPool = pool;

let initialized = false;

async function ensureDb() {
  if (!pool || initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prooflayer_receipts (
      id UUID PRIMARY KEY,
      agent_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL,
      UNIQUE(agent_id, sequence)
    );
    CREATE INDEX IF NOT EXISTS prooflayer_agent_idx
      ON prooflayer_receipts(agent_id, sequence);
  `);
  initialized = true;
}

function demoReceipt(
  id:string, sequence:number, previous_hash:string|null, created_at:string,
  input:ReceiptInput
): Receipt {
  const base = { ...input, id, sequence, previous_hash, created_at };
  return { ...base, hash: hashReceipt(base), demo:true };
}

function ensureDemo() {
  if ([...memory.values()].some(r => r.agent_id === "demo-agent")) return;
  const one = demoReceipt(
    "00000000-0000-4000-8000-000000000001", 1, null, "2026-10-04T10:00:00.000Z",
    { agent_id:"demo-agent", model:"example-model-v1", action:"Summarized an incident report", reason:"Create a concise operator brief", evidence:["demo://incident-17"], policy_version:"demo-policy-1", result:"Brief generated for human review" }
  );
  const two = demoReceipt(
    "00000000-0000-4000-8000-000000000002", 2, one.hash, "2026-10-04T10:05:00.000Z",
    { agent_id:"demo-agent", model:"example-model-v1", action:"Flagged an unsupported claim", reason:"Evidence did not support the requested conclusion", evidence:["demo://incident-17","demo://source-4"], policy_version:"demo-policy-1", result:"Claim marked unresolved" }
  );
  memory.set(one.id, one);
  memory.set(two.id, two);
}
ensureDemo();

export function storeMode() {
  return pool ? "postgres" as const : "demo-memory" as const;
}

function rowReceipt(row:{payload:Receipt|string}) {
  return (typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload) as Receipt;
}

async function latestWithClient(client:PoolClient, agentId:string) {
  const r = await client.query("SELECT payload FROM prooflayer_receipts WHERE agent_id=$1 ORDER BY sequence DESC LIMIT 1",[agentId]);
  return r.rows[0] ? rowReceipt(r.rows[0]) : null;
}

export async function createReceipt(input:ReceiptInput):Promise<Receipt> {
  if (!pool) {
    const previous = [...memory.values()].filter(r=>r.agent_id===input.agent_id).sort((a,b)=>b.sequence-a.sequence)[0] ?? null;
    const receipt = makeReceipt(input, previous);
    memory.set(receipt.id, receipt);
    return receipt;
  }

  await ensureDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[input.agent_id]);
    const previous = await latestWithClient(client,input.agent_id);
    const receipt = makeReceipt(input,previous);
    await client.query(
      "INSERT INTO prooflayer_receipts(id,agent_id,sequence,hash,created_at,payload) VALUES($1,$2,$3,$4,$5,$6::jsonb)",
      [receipt.id,receipt.agent_id,receipt.sequence,receipt.hash,receipt.created_at,JSON.stringify(receipt)]
    );
    await client.query("COMMIT");
    return receipt;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getReceipt(id:string):Promise<Receipt|null> {
  if (!pool) return memory.get(id) ?? null;
  await ensureDb();
  const r=await pool.query("SELECT payload FROM prooflayer_receipts WHERE id=$1",[id]);
  return r.rows[0] ? rowReceipt(r.rows[0]) : null;
}

export async function getAgentReceipts(agentId:string):Promise<Receipt[]> {
  if (!pool) return [...memory.values()].filter(r=>r.agent_id===agentId).sort((a,b)=>a.sequence-b.sequence);
  await ensureDb();
  const r=await pool.query("SELECT payload FROM prooflayer_receipts WHERE agent_id=$1 ORDER BY sequence ASC",[agentId]);
  return r.rows.map(rowReceipt);
}
