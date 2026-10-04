import { NextResponse } from "next/server";
import { verifyChain } from "@/lib/receipts";
import { getAgentReceipts } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const receipts=await getAgentReceipts(id);
  if(!receipts.length) return NextResponse.json({error:"Agent not found"},{status:404});
  return NextResponse.json({agent_id:id, chain:verifyChain(receipts), receipts});
}
