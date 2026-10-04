import { createHash, randomUUID } from "node:crypto";

export type ReceiptInput = {
  agent_id: string;
  model: string;
  action: string;
  reason: string;
  evidence: string[];
  policy_version: string;
  result: string;
};

export type Receipt = ReceiptInput & {
  id: string;
  created_at: string;
  previous_hash: string | null;
  sequence: number;
  hash: string;
  demo?: boolean;
};

const text = (value: unknown, max: number, field: string) => {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const v = value.trim();
  if (!v || v.length > max) throw new Error(`${field} must be 1-${max} characters`);
  return v;
};

export function validateInput(raw: unknown): ReceiptInput {
  if (!raw || typeof raw !== "object") throw new Error("body must be a JSON object");
  const r = raw as Record<string, unknown>;
  const evidence = Array.isArray(r.evidence) ? r.evidence : [];
  if (evidence.length > 20) throw new Error("evidence supports at most 20 references");
  return {
    agent_id: text(r.agent_id, 120, "agent_id"),
    model: text(r.model, 120, "model"),
    action: text(r.action, 500, "action"),
    reason: text(r.reason, 2000, "reason"),
    evidence: evidence.map((v, i) => text(v, 1000, `evidence[${i}]`)),
    policy_version: text(r.policy_version, 120, "policy_version"),
    result: text(r.result, 2000, "result"),
  };
}

export function canonicalPayload(receipt: Omit<Receipt, "hash" | "demo">) {
  return JSON.stringify({
    id: receipt.id,
    agent_id: receipt.agent_id,
    model: receipt.model,
    action: receipt.action,
    reason: receipt.reason,
    evidence: receipt.evidence,
    policy_version: receipt.policy_version,
    result: receipt.result,
    created_at: receipt.created_at,
    previous_hash: receipt.previous_hash,
    sequence: receipt.sequence,
  });
}

export function hashReceipt(receipt: Omit<Receipt, "hash" | "demo">) {
  return createHash("sha256").update(canonicalPayload(receipt), "utf8").digest("hex");
}

export function makeReceipt(input: ReceiptInput, previous: Receipt | null, now = new Date()): Receipt {
  const base = {
    ...input,
    id: randomUUID(),
    created_at: now.toISOString(),
    previous_hash: previous?.hash ?? null,
    sequence: (previous?.sequence ?? 0) + 1,
  };
  return { ...base, hash: hashReceipt(base) };
}

export function verifyReceipt(receipt: Receipt) {
  const { hash, demo: _demo, ...base } = receipt;
  return { valid: hashReceipt(base) === hash, expected_hash: hashReceipt(base), recorded_hash: hash };
}

export function verifyChain(receipts: Receipt[]) {
  const ordered = [...receipts].sort((a,b)=>a.sequence-b.sequence);
  let previous: Receipt | null = null;
  for (const receipt of ordered) {
    const check = verifyReceipt(receipt);
    if (!check.valid) return { valid:false, broken_at:receipt.id, reason:"hash_mismatch" as const };
    if ((previous?.hash ?? null) !== receipt.previous_hash) {
      return { valid:false, broken_at:receipt.id, reason:"previous_hash_mismatch" as const };
    }
    if (receipt.sequence !== (previous?.sequence ?? 0) + 1) {
      return { valid:false, broken_at:receipt.id, reason:"sequence_mismatch" as const };
    }
    previous = receipt;
  }
  return { valid:true, broken_at:null, reason:null };
}
