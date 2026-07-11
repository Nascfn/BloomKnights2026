import { useState } from 'react';
import { analyzeImage } from './api/client.js';

const RETRY_STATUSES = new Set(['UNIDENTIFIABLE', 'ERROR', 'TICKER_NOT_VERIFIED']);

function App() {
  const [phase, setPhase] = useState('scan');
  const [result, setResult] = useState(null);

  async function handleScan(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const image = formData.get('image');
    const monthly = formData.get('monthly') || '100';

    if (!(image instanceof File) || image.size === 0) {
      return;
    }

    setPhase('loading');
    setResult(null);

    const analysis = await analyzeImage(image, monthly);
    setResult(analysis);
    setPhase('done');
  }

  function handleReset() {
    setResult(null);
    setPhase('scan');
  }

  function renderContent() {
    if (phase === 'loading') {
      return <LoadingState />;
    }

    if (phase === 'done') {
      return <DoneState result={result} onReset={handleReset} />;
    }

    return <ScanState onScan={handleScan} />;
  }

  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="app-title">
        <p className="eyebrow">Bloom Knights 2026</p>
        <h1 id="app-title">Who Owns It?</h1>
        {renderContent()}
      </section>
    </main>
  );
}

function ScanState({ onScan }) {
  return (
    <form className="scan-form" onSubmit={onScan}>
      <label>
        Product photo
        <input type="file" name="image" accept="image/*" capture="environment" required />
      </label>

      <label>
        Monthly investment
        <input type="number" name="monthly" min="1" step="1" defaultValue="100" />
      </label>

      <button type="submit">Scan product</button>
    </form>
  );
}

function LoadingState() {
  return (
    <div className="status-panel" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>Tracing the corporate family tree...</p>
    </div>
  );
}

function DoneState({ result, onReset }) {
  const status = result?.status;

  if (status === 'US_PUBLIC') {
    return <ResultPlaceholder result={result} onReset={onReset} />;
  }

  if (status === 'PRIVATE') {
    return <ResultPlaceholder result={result} onReset={onReset} />;
  }

  if (status === 'FOREIGN') {
    return <ResultPlaceholder result={result} onReset={onReset} />;
  }

  if (RETRY_STATUSES.has(status)) {
    return <RetryPlaceholder result={result} onReset={onReset} />;
  }

  return <RetryPlaceholder result={result} onReset={onReset} />;
}

function ResultPlaceholder({ result, onReset }) {
  return (
    <div className="result-stack">
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <button type="button" onClick={onReset}>
        Scan another product
      </button>
    </div>
  );
}

function RetryPlaceholder({ result, onReset }) {
  return (
    <div className="result-stack">
      <p>{result?.message || 'We could not identify this product. Try another scan.'}</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <button type="button" onClick={onReset}>
        Scan again
      </button>
    </div>
  );
}

export default App;
