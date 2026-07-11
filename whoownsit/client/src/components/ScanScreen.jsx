import { useRef, useState } from "react";

function ScanScreen({ onScan }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [monthly, setMonthly] = useState(100);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) return;
    onScan(file, monthly);
  };

  return (
    <section className="card" aria-labelledby="scan-title">
      <img src="/logo.png" alt="" className="logo" />
      <p className="eyebrow">Bloom Knights 2026</p>
      <h1 id="scan-title">Who Owns It?</h1>
      <p>
        Scan a product, trace its parent company, and see what a monthly stock
        investment could have looked like.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          hidden
        />
        <button
          type="button"
          className="picker"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? file.name : "Take or choose a photo"}
        </button>

        <label htmlFor="monthly-amount">$/month to invest</label>
        <input
          id="monthly-amount"
          type="number"
          min="1"
          step="1"
          value={monthly}
          onChange={(event) => setMonthly(Number(event.target.value))}
        />

        <button type="submit" className="primary" disabled={!file}>
          Scan
        </button>
      </form>
    </section>
  );
}

export default ScanScreen;
