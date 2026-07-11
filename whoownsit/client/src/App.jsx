import { useState } from "react";
import ScanScreen from "./components/ScanScreen";
import LoadingScreen from "./components/LoadingScreen";
import { analyzeImage } from "./api/client.js";

function App() {
  const [phase, setPhase] = useState("scan");
  const [result, setResult] = useState(null);

  async function handleScan(file, monthly) {
    setPhase("loading");
    setResult(null);

    const analysis = await analyzeImage(file, monthly);
    setResult(analysis);
    setPhase("done");
  }

  function handleReset() {
    setResult(null);
    setPhase("scan");
  }

  return (
    <main className="app-shell">
      {phase === "scan" && <ScanScreen onScan={handleScan} />}
      {phase === "loading" && <LoadingScreen />}
      {phase === "done" && <DoneState result={result} onReset={handleReset} />}
    </main>
  );
}

function DoneState({ result, onReset }) {
  const status = result?.status;

  // Placeholders until the dedicated screens land:
  // US_PUBLIC -> ResultScreen (#20), PRIVATE/FOREIGN -> their screens (#15).
  if (status === "US_PUBLIC" || status === "PRIVATE" || status === "FOREIGN") {
    return <ResultPlaceholder result={result} onReset={onReset} />;
  }

  // UNIDENTIFIABLE, ERROR, TICKER_NOT_VERIFIED, or anything unexpected.
  return <RetryPlaceholder result={result} onReset={onReset} />;
}

function ResultPlaceholder({ result, onReset }) {
  return (
    <section className="card result-stack">
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <button type="button" className="primary" onClick={onReset}>
        Scan another product
      </button>
    </section>
  );
}

function RetryPlaceholder({ result, onReset }) {
  return (
    <section className="card result-stack">
      <p>{result?.message || "We could not identify this product. Try another scan."}</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <button type="button" className="primary" onClick={onReset}>
        Scan again
      </button>
    </section>
  );
}

export default App;
