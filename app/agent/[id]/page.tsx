import { getAgentReceipts } from "@/lib/store";
import { verifyChain } from "@/lib/receipts";
import { notFound } from "next/navigation";

export const dynamic="force-dynamic";

export default async function AgentPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const receipts=await getAgentReceipts(id); if(!receipts.length) notFound();
 const chain=verifyChain(receipts);
 return <main className="wrap">
   <div className="eyebrow">Agent history</div>
   <h1>{id}</h1>
   <p className={chain.valid?"ok":"bad"}>{chain.valid?"✓ CHAIN INTERNALLY CONSISTENT":"✕ CHAIN BROKEN"}</p>
   <p className="muted">{receipts.length} receipt{receipts.length===1?"":"s"} · verification checks stored payload hashes, sequence, and previous-hash links.</p>
   {receipts.map(r=><div className="receipt" key={r.id}>
     <span className="pill">#{r.sequence}{r.demo?" · DEMO":""}</span>
     <h2>{r.action}</h2>
     <p>{r.result}</p>
     <div className="hash">{r.hash}</div>
     <p><a href={"/receipt/"+r.id}>Inspect receipt →</a></p>
   </div>)}
 </main>;
}
