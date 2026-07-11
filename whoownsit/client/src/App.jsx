import { useState } from "react";
import ScanScreen from "./components/ScanScreen";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";
import PrivateScreen from "./components/PrivateScreen";
import ForeignScreen from "./components/ForeignScreen";
import RetryScreen from "./components/RetryScreen";
import { analyzeImage } from "./api/client.js";

function App() {
  const [phase, setPhase] = useState("scan");
  const [result, setResult] = useState(null);

  async function handleScan(file) {
    setPhase("loading");
    setResult(null);

    // The DCA slider on the result screen recomputes client-side, so the
    // initial server-computed amount is just a sensible default.
    const analysis = await analyzeImage(file, 100);
    setResult(analysis);
    setPhase("done");
  }

  function handleReset() {
    setResult(null);
    setPhase("scan");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/logo.png" alt="" className="topbar-logo" />
          <span className="topbar-wordmark">Who Owns It?</span>
        </div>
        <span className="topbar-live">
          <span className="topbar-dot" aria-hidden="true" />
          Live market data
        </span>
      </header>

      <div className="page-wrap">
        <div className="page">
          {phase === "scan" && <ScanScreen onScan={handleScan} />}
          {phase === "loading" && <LoadingScreen />}
          {phase === "done" && <DoneState result={result} onReset={handleReset} />}
        </div>
      </div>
    </main>
  );
}

function DoneState({ result, onReset }) {
  switch (result?.status) {
    case "US_PUBLIC":
      return <ResultScreen result={result} onReset={onReset} />;
    case "PRIVATE":
      return <PrivateScreen result={result} onReset={onReset} />;
    case "FOREIGN":
      return <ForeignScreen result={result} onReset={onReset} />;
    default:
      // UNIDENTIFIABLE, ERROR, TICKER_NOT_VERIFIED, or anything unexpected.
      return <RetryScreen result={result} onReset={onReset} />;
  }
}

export default App;
