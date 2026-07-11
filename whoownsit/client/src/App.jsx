import { useEffect, useState } from "react";
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
  const [mock, setMock] = useState(null);

  // Mode badge: lets everyone see at a glance whether they're testing
  // against mock data or live Gemini + FMP.
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((health) => setMock(health.mock))
      .catch(() => {});
  }, []);

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
      {mock !== null && (
        <span className={mock ? "mode-badge mode-badge-mock" : "mode-badge"}>
          {mock ? "🎭 Mock data" : "● Live"}
        </span>
      )}
      {phase === "scan" && <ScanScreen onScan={handleScan} />}
      {phase === "loading" && <LoadingScreen />}
      {phase === "done" && <DoneState result={result} onReset={handleReset} />}
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
