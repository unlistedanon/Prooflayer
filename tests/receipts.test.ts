import test from "node:test";
import assert from "node:assert/strict";
import { hashReceipt, makeReceipt, verifyChain, verifyReceipt, type ReceiptInput } from "../lib/receipts";

const input:ReceiptInput={
 agent_id:"agent-test",model:"model-1",action:"Checked a claim",reason:"Need evidence",
 evidence:["artifact:1"],policy_version:"v1",result:"Unresolved"
};

test("hash is stable for identical canonical data",()=>{
 const base={...input,id:"11111111-1111-4111-8111-111111111111",created_at:"2026-10-04T10:00:00.000Z",previous_hash:null,sequence:1};
 assert.equal(hashReceipt(base),hashReceipt({...base}));
});

test("tampering is detected",()=>{
 const r=makeReceipt(input,null,new Date("2026-10-04T10:00:00.000Z"));
 assert.equal(verifyReceipt(r).valid,true);
 assert.equal(verifyReceipt({...r,result:"Changed after recording"}).valid,false);
});

test("valid chain passes and broken previous hash fails",()=>{
 const one=makeReceipt(input,null,new Date("2026-10-04T10:00:00.000Z"));
 const two=makeReceipt({...input,action:"Second action"},one,new Date("2026-10-04T10:01:00.000Z"));
 assert.equal(verifyChain([one,two]).valid,true);
 const broken={...two,previous_hash:"deadbeef"};
 assert.equal(verifyChain([one,broken]).valid,false);
});
