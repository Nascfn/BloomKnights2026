import { useState } from "react";
import ScanScreen from "./components/ScanScreen";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [phase, setPhase] = useState("scan");

  const handleScan = () => {
    setPhase("loading");
  };

  return (
    <main className="app-shell">
      {phase === "scan" && <ScanScreen onScan={handleScan} />}
      {phase === "loading" && <LoadingScreen />}
    </main>
  );
}

export default App;
