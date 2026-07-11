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

  // The hero logo only shrinks into a header once a scan is in flight or
  // done, so it stays visible while the image's info is shown to the user.
  const isCompact = phase !== "scan";

  return (
    <main className="app-shell">
      <div className="page">
        <div className={`brand-header${isCompact ? " is-compact" : ""}`}>
          <div className="brand-stage">
            <img src="/logo.png" alt="" className="logo" />
            <div className="brand-copy">
              {!isCompact && <p className="eyebrow">Bloom Knights 2026</p>}
              <h1 id="scan-title" className="brand-title">
                Who Owns It?
              </h1>
            </div>
          </div>
        </div>

        {phase === "scan" && <ScanScreen onScan={handleScan} />}
        {phase === "loading" && <LoadingScreen />}
        {phase === "done" && <DoneState result={result} onReset={handleReset} />}
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
