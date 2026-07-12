import { useEffect, useState } from "react";

const MESSAGES = [
  "Tracing the corporate family tree…",
  "Cross-referencing SEC filings…",
  "Checking who really owns this…",
  "Crunching a year of price history…",
];

function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="card loading-card" aria-live="polite">
      <div className="ai-loader">
        <div className="ai-loader-glow" aria-hidden="true" />
        <div className="ai-loader-ring" aria-hidden="true">
          <div className="ai-loader-core">
            <img src="/logo.png" alt="" className="ai-loader-logo" />
          </div>
        </div>
      </div>
      <p key={index} className="loading-message">
        {MESSAGES[index]}
      </p>
    </section>
  );
}

export default LoadingScreen;
