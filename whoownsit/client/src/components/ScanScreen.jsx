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

  const openPicker = () => fileInputRef.current?.click();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <img src="/logo.png" alt="" className="hero-mascot" />
      <p className="hero-pill">Presented by Detective Lenny</p>
      <h1 id="hero-title" className="hero-headline">
        Investigate
        <br />
        <span className="hero-accent">Every Item</span>
        <br />
        You Buy
      </h1>
      <p className="hero-subtitle">
        Scan any grocery product to uncover who owns it, how their stock is
        performing, and what it would mean for your portfolio.
      </p>

      <form onSubmit={handleSubmit} className="hero-form">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          hidden
        />

        {hasFile && <p className="hero-filename">{file.name}</p>}

        <button
          type={hasFile ? "submit" : "button"}
          className="hero-cta"
          onClick={hasFile ? undefined : openPicker}
        >
          {hasFile ? "Scan now" : "Start scanning"} <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="hero-caption">No account needed · Free to use</p>
    </section>
  );
}

export default ScanScreen;
