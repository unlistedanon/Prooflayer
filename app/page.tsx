"use client";
import { FormEvent, useState } from "react";

type Created={receipt:{id:string;hash:string;agent_id:string;sequence:number};storage:string};

export default function Home(){
 const [created,setCreated]=useState<Created|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);

 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault(); setBusy(true); setError(""); setCreated(null);
   const f=new FormData(e.currentTarget);
   const body={
    agent_id:f.get("agent_id"), model:f.get("model"), action:f.get("action"),
    reason:f.get("reason"), evidence:String(f.get("evidence")||"").split("\n").map(x=>x.trim()).filter(Boolean),
    policy_version:f.get("policy_version"), result:f.get("result")
   };
   try{
    const res=await fetch("/api/receipts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||"Request failed");
    setCreated(data);
   }catch(err){setError(err instanceof Error?err.message:"Request failed")}finally{setBusy(false)}
 }

 return <main className="wrap">
  <section className="hero">
    <div className="eyebrow">Evidence infrastructure for AI agents</div>
    <h1>Your agent says it did something. Prove what was recorded.</h1>
    <p>ProofLayer creates tamper-evident activity receipts, links each agent&apos;s receipts into an ordered checksum chain, and exposes a verification API. The receipt proves record consistency. Attached evidence is what must prove the underlying action.</p>
    <a className="button" href="#create">Create a receipt</a>
  </section>

  <section className="grid" id="create">
   <div className="card">
    <h2>Create receipt</h2>
    <p className="muted">No account required in the MVP. Use a stable agent ID.</p>
    <form onSubmit={submit}>
      <label>AGENT ID</label><input name="agent_id" defaultValue="my-agent" required/>
      <label>MODEL</label><input name="model" defaultValue="gpt-5.6" required/>
      <label>ACTION</label><input name="action" placeholder="What did the agent do?" required/>
      <label>REASON</label><textarea name="reason" placeholder="Why did it take this action?" required/>
      <label>EVIDENCE REFERENCES · one per line</label><textarea name="evidence" placeholder={"https://...\ntransaction:...\nartifact:..."}/>
      <label>POLICY VERSION</label><input name="policy_version" defaultValue="v1" required/>
      <label>RESULT</label><textarea name="result" placeholder="What happened?" required/>
      <button disabled={busy}>{busy?"Recording...":"Record receipt"}</button>
    </form>
    {error&&<p className="bad">{error}</p>}
   </div>
   <div className="card">
    <h2>Verification, without theater.</h2>
    <p>A valid ProofLayer receipt means its stored fields still produce the recorded SHA-256 checksum and the agent&apos;s chain is internally consistent.</p>
    <p className="muted">It does not magically prove a claimed trade, message, deployment, or physical-world event happened. That requires independently useful evidence.</p>
    {created&&<div className="receipt">
      <span className="pill">{created.storage}</span>
      <h3>Receipt #{created.receipt.sequence}</h3>
      <div className="hash">{created.receipt.hash}</div>
      <a className="button" href={"/receipt/"+created.receipt.id}>Inspect receipt</a>
    </div>}
    <div className="receipt">
      <span className="pill">DEMO</span>
      <h3>See a complete chain</h3>
      <p className="muted">Sample data only. Never counted as adoption.</p>
      <a href="/agent/demo-agent">Open demo agent →</a>
    </div>
   </div>
  </section>
 </main>;
}
