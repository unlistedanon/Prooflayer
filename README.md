# ProofLayer

**Your agent says it did something. Prove what was recorded.**

ProofLayer is a small developer tool for tamper-evident AI-agent activity receipts.

## v0

- `POST /api/receipts` creates a structured receipt.
- `GET /api/receipts/:id` retrieves it.
- `GET /api/receipts/:id/verify` recomputes its SHA-256 checksum.
- `GET /api/agents/:id` returns ordered history plus chain verification.
- Public receipt and agent pages make records inspectable without developer tooling.
- PostgreSQL is the production persistence path.
- Without `DATABASE_URL`, the app explicitly runs in ephemeral `demo-memory` mode.

## Start locally

```bash
npm install
npm test
npm run dev
```

Open http://localhost:3000.

## Production persistence

Provide a PostgreSQL connection string:

```bash
DATABASE_URL=postgresql://user:password@host:5432/prooflayer
```

The first database-backed request creates the minimal receipt table and index automatically.

## Verification boundary

A valid ProofLayer receipt proves that its stored fields still produce its recorded checksum. A valid agent chain additionally proves the available sequence and previous-hash links are internally consistent.

It does **not** independently prove that the claimed underlying action happened. The evidence attached to a receipt must do that job.

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the threat model and explicit non-claims.

## Product rule

Usage before architecture. The next feature is earned by external users, not by our ability to imagine it.
