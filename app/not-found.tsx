import Link from "next/link";

export default function NotFound() {
  return <main className="route-state"><div className="generation-mark">G</div><span>404 · GTM LAB</span><h1>That workspace does not exist.</h1><p>Return to GTM Lab to build a strategy or explore the researched company demos.</p><Link href="/">Return to GTM Lab →</Link></main>;
}
