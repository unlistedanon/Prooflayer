import { NextRequest, NextResponse } from "next/server";
import { validateInput } from "@/lib/receipts";
import { createReceipt, storeMode } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request:NextRequest) {
  try {
    const raw = await request.json();
    const input = validateInput(raw);
    const receipt = await createReceipt(input);
    return NextResponse.json({ receipt, storage:storeMode() },{status:201});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error:message },{status:400});
  }
}

export async function GET() {
  return NextResponse.json({
    service:"ProofLayer",
    status:"ok",
    storage:storeMode(),
    warning: storeMode()==="demo-memory" ? "Receipts are ephemeral until DATABASE_URL is configured." : undefined
  });
}
