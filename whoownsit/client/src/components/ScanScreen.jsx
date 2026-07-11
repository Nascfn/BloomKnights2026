import { useRef, useState } from "react";

function ScanScreen({ onScan }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const hasFile = Boolean(file);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) return;
    onScan(file);
  };

  return (
    <section className="card" aria-labelledby="scan-title">
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

        {hasFile && (
          <button type="submit" className="primary">
            Scan
          </button>
        )}
      </form>
    </section>
  );
}

export default ScanScreen;
