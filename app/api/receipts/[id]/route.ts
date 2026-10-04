import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const receipt=await getReceipt(id);
  if(!receipt) return NextResponse.json({error:"Receipt not found"},{status:404});
  return NextResponse.json({receipt});
}
