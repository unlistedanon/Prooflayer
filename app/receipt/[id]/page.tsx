import { getReceipt } from "@/lib/store";
import { verifyReceipt } from "@/lib/receipts";
import { notFound } from "next/navigation";

export const dynamic="force-dynamic";

export default async function ReceiptPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const receipt=await getReceipt(id); if(!receipt) notFound();
 const check=verifyReceipt(receipt);
 return <main className="wrap">
   <div className="eyebrow">Receipt {receipt.sequence}</div>
   <h1>{receipt.action}</h1>
   <p className={check.valid?"ok":"bad"}>{check.valid?"✓ STORED PAYLOAD VALID":"✕ CHECKSUM MISMATCH"}</p>
   {receipt.demo&&<span className="pill">DEMO DATA</span>}
   <div className="grid" style={{marginTop:24}}>
    <div className="card"><h3>Agent</h3><a href={"/agent/"+encodeURIComponent(receipt.agent_id)}>{receipt.agent_id}</a><p className="muted">Model: {receipt.model}<br/>Policy: {receipt.policy_version}<br/>Created: {receipt.created_at}</p></div>
    <div className="card"><h3>Result</h3><p>{receipt.result}</p><h3>Reason</h3><p className="muted">{receipt.reason}</p></div>
   </div>
   <div className="card" style={{marginTop:20}}><h3>Evidence references</h3>{receipt.evidence.length?receipt.evidence.map((e,i)=><div className="hash" key={i}>{e}</div>):<p className="muted">None supplied.</p>}</div>
   <div className="card" style={{marginTop:20}}><h3>Recorded hash</h3><div className="hash">{receipt.hash}</div><h3>Previous hash</h3><div className="hash">{receipt.previous_hash??"GENESIS"}</div></div>
 </main>;
}
