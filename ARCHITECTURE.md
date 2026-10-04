# ProofLayer v0 architecture

## Exact claim

ProofLayer records structured AI-agent activity and makes later modification of that stored record detectable through deterministic SHA-256 checksums and per-agent previous-hash links.

## What a valid receipt proves

A valid receipt proves that the stored receipt fields still canonicalize to the checksum recorded for that receipt. A valid chain additionally proves that the available receipts are ordered consistently by sequence and previous-hash reference.

## What it does not prove

ProofLayer v0 does not prove that the claimed underlying action occurred. A receipt saying "sent a transaction" is not transaction evidence. A receipt saying "emailed a customer" is not mail-provider evidence. Evidence references should point to independently useful artifacts, provider records, transaction identifiers, logs, signed outputs, or other appropriate proof.

ProofLayer v0 is not a blockchain, decentralized network, formal audit, identity authority, or trusted execution environment.

## Data model

Each receipt stores:
- agent ID
- model identifier
- action
- reason
- evidence references
- policy version
- result
- immutable creation time
- sequence number
- previous receipt hash
- SHA-256 hash

The hash is computed from a deterministic JSON field order in `lib/receipts.ts`.

## Persistence

When `DATABASE_URL` is configured, receipts are persisted to PostgreSQL. Creation obtains a transaction-scoped PostgreSQL advisory lock keyed by agent ID, reads the latest receipt, creates the next link, inserts it, and commits.

Without `DATABASE_URL`, the app explicitly reports `demo-memory` mode. That mode is for evaluation only and is not durable across process restarts or serverless invocations.

## Threat model

v0 detects accidental or malicious mutation of receipt payloads relative to their stored checksums, and broken links inside the available receipt sequence.

v0 does not defend against an operator with sufficient database access rewriting both payloads and hashes, deleting history, fabricating evidence, impersonating an agent, or compromising the application before receipt creation. Stronger signing, external anchoring, authenticated agent identity, append-only storage, and independent witnesses are later layers only if user demand justifies them.
