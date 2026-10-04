export default function Docs(){
 const curl=`curl -X POST https://YOUR_HOST/api/receipts \\\n  -H "content-type: application/json" \\\n  -d '{
    "agent_id":"research-agent-01",
    "model":"your-model",
    "action":"Produced a source-backed summary",
    "reason":"Operator requested a briefing",
    "evidence":["https://example.com/source"],
    "policy_version":"v1",
    "result":"Summary returned for human review"
  }'`;
 const ts=`const receipt = await fetch("https://YOUR_HOST/api/receipts", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    agent_id: "research-agent-01",
    model: "your-model",
    action: "Produced a source-backed summary",
    reason: "Operator requested a briefing",
    evidence: ["https://example.com/source"],
    policy_version: "v1",
    result: "Summary returned for human review"
  })
}).then(r => r.json());`;
 return <main className="wrap">
   <div className="eyebrow">Developer docs</div><h1>Integrate in minutes.</h1>
   <div className="card"><h2>1. Create a receipt</h2><div className="code">{curl}</div></div>
   <br/><div className="card"><h2>TypeScript</h2><div className="code">{ts}</div></div>
   <br/><div className="card"><h2>2. Verify it</h2><div className="code">GET /api/receipts/:id/verify{"\n"}GET /api/agents/:id</div>
   <p className="muted">Verification scope is deliberately narrow: stored payload consistency and chain continuity. Evidence remains responsible for substantiating the claimed action.</p></div>
 </main>;
}
