import type { Metadata } from "next";
import "./globals.css";

export const metadata:Metadata={
  title:"ProofLayer",
  description:"Tamper-evident activity receipts for AI agents."
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="nav"><a className="brand" href="/">ProofLayer</a><nav><a href="/docs">Docs</a><a href="/agent/demo-agent">Demo agent</a></nav></header>
    {children}
    <footer>ProofLayer verifies recorded data consistency. Evidence must prove the underlying claim.</footer>
  </body></html>;
}
