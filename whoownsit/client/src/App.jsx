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
  const [photoUrl, setPhotoUrl] = useState(null);

  async function handleScan(file) {
    setPhase("loading");
    setResult(null);

    // Keep a local preview of the scanned photo to show on the result screen.
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    // The DCA slider on the result screen recomputes client-side, so the
    // initial server-computed amount is just a sensible default.
    const analysis = await analyzeImage(file, 100);
    setResult(analysis);
    setPhase("done");
  }

  function handleReset() {
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResult(null);
    setPhase("scan");
  }

  // The scan phase is a full-bleed hero with its own overlaid nav; the
  // loading/result phases sit on the light theme under a slim sticky header.
  if (phase === "scan") {
    return (
      <main className="app-shell">
        <ScanScreen onScan={handleScan} />
      </main>
    );
  }

  const isFullWidth = phase === "done" && result?.status === "US_PUBLIC";

  return (
    <main className="app-shell">
      <header className="nav app-header">
        <div className="nav-brand">
          <button type="button" className="nav-home" onClick={handleReset}>
            ‹ Home
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <img src="/logo.png" alt="" className="nav-logo" />
          <span className="nav-wordmark">Who Owns It?</span>
        </div>
        <span className="nav-live">
          <span className="nav-dot" aria-hidden="true" />
          Live
        </span>
      </header>

      {isFullWidth ? (
        <ResultScreen result={result} onReset={handleReset} photoUrl={photoUrl} />
      ) : (
        <div className="page-wrap">
          <div className="page">
            {phase === "loading" && <LoadingScreen />}
            {phase === "done" && <DoneState result={result} onReset={handleReset} />}
          </div>
        </div>
      )}
    </main>
  );
}

function DoneState({ result, onReset }) {
  switch (result?.status) {
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
