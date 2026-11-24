# 1337 Gang release: ProofLayer v0.1.0

**FREE & OPEN SOURCE — MIT LICENSE on this release branch**  
**Release lane:** public branch `release/1337-gang-2026-11-19`  
**Maintainer:** [unlistedanon](https://github.com/unlistedanon)

## What it does

ProofLayer records structured agent-action *claims* as SHA-256 receipts, preserves ordered per-agent chains, and provides APIs and public views for examining the resulting records.

- `POST /api/receipts` — record an activity receipt
- `GET /api/receipts/:id` — inspect a receipt
- `GET /api/receipts/:id/verify` — recalculate its checksum
- `GET /api/agents/:id` — inspect sequential history and internal chain integrity
- Local demo mode works without PostgreSQL but **does not preserve data between runs**.

## Start locally

**Requirements:** Node.js 22+, npm. PostgreSQL is required for persistence; a database connection is not required for the ephemeral demo.

```bash
git clone --branch release/1337-gang-2026-11-19 https://github.com/unlistedanon/Prooflayer.git
cd Prooflayer
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Visit `http://localhost:3000`. To enable persistence, configure `DATABASE_URL` privately; see `.env.example` and the README's database TLS section. Never commit `.env`, tokens, database credentials, or actual customer/agent evidence.

## Verification receipts

- GitHub mainline CI succeeded at [176bc74](https://github.com/unlistedanon/Prooflayer/actions/runs/37195692422) on 2026-10-04.
- Repository-hardening CI succeeded at [a38f617](https://github.com/unlistedanon/Prooflayer/actions/runs/40838746408) on 2026-10-29; this release branch inherits that code.
- CI checks Node tests, TypeScript, and Next.js build. CI is not an external deployment, authenticated API penetration test, or real-world evidence verification.

## What the receipts mean—and don't

An intact checksum means the retained fields match their stored hash. Chain integrity means available records reference each other consistently. Neither proves the action actually happened. A sufficiently privileged database operator could rewrite or delete both records and hashes.

For evidence claims, use independent provider logs, signed records, transaction IDs, or other underlying sources. Read [ARCHITECTURE.md](ARCHITECTURE.md) before deploying.

## Security and deployment limits

The app is a developer/demo foundation, **not a hardened public receipt ingestion service**. Do not deploy write APIs on the public internet without authentication, request limits, abuse controls, access-control policy, and an operational database backup plan. Keep the default local demo local.

Remote PostgreSQL TLS is verified by default on the hardening branch. Use development-only TLS opt-outs only when you understand the consequences.

## License and contributions

The project-authored source on this branch is provided under the [MIT License](LICENSE). Dependencies retain their own licenses. Test and reproduce locally, file an issue with steps, and open small pull requests.

**1337 Gang:** shipping auditable developer primitives, not selling claims that receipts magically establish facts.
