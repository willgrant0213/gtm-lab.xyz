"use client";

export default function ErrorState({ reset }: { reset: () => void }) {
  return <main className="route-state"><div className="generation-mark">G</div><span>WORKSPACE ERROR</span><h1>GTM Lab hit a temporary problem.</h1><p>Your browser-saved projects have not been changed. Try loading the workspace again.</p><button onClick={reset}>Try again →</button></main>;
}
