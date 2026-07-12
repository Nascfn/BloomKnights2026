import { useRef } from "react";

const FEATURES = [
  {
    title: "Ownership Chain",
    desc: "Trace any product back through subsidiaries to its ultimate parent company.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Live Stock Tracker",
    desc: "Real-time price, 1-year history, and key financial stats — right in the aisle.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20v-6" />
      </svg>
    ),
  },
  {
    title: "News Intelligence",
    desc: "Recent major headlines that affect the brands behind what you buy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="8" r="2.5" />
        <path d="M6 8.5v7" />
        <path d="M18 10.5c0 4-6 1.5-6 5.5" />
      </svg>
    ),
  },
  {
    title: "Investment Calculator",
    desc: "See what any past investment in that stock would be worth today.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
      </svg>
    ),
  },
];

const TEAM = [
  { name: "Sanjay Parsam", url: "https://www.linkedin.com/in/sanjay-parsam/" },
  { name: "Paulo Fernandes Nascimento", url: "https://www.linkedin.com/in/paulofn/" },
  { name: "Ana Clara Machado Goncalves", url: "https://www.linkedin.com/in/anaaclra04/" },
  { name: "Nicole Gonzalez", url: "https://www.linkedin.com/in/nicole-gonzalez-42638b298/" },
];

function ScanScreen({ onScan }) {
  const fileInputRef = useRef(null);

  // Picking a photo starts the scan immediately — no second click.
  const handleFileChange = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = ""; // so re-picking the same file still fires
    if (picked) onScan(picked);
  };

  const openPicker = () => fileInputRef.current?.click();

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <img src="/hero-bg.png" alt="" className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />

        <nav className="nav hero-nav">
          <div className="nav-brand">
            <span className="nav-wordmark">Who Owns It?</span>
          </div>
          <span className="nav-live">
            <span className="nav-dot" aria-hidden="true" />
            Live market data
          </span>
        </nav>

        <div className="hero-content">
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
            Snap a photo of any product to reveal the company that really owns
            it — the full ownership chain, live market data, and what a few
            dollars a month invested last year would be worth today.
          </p>

          <div className="hero-form">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              hidden
            />

            <button type="button" className="hero-cta" onClick={openPicker}>
              Start scanning <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="hero-caption">No account needed · Free to use</p>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-text">SCROLL</span>
        </div>
      </section>

      <section className="features" aria-labelledby="features-title">
        <div className="features-head">
          <img src="/logo.png" alt="" className="features-logo" />
          <h2 id="features-title" className="features-title">
            What Lenny Finds For You
          </h2>
        </div>
        <p className="features-sub">Four tools. One scan. Total transparency.</p>

        <div className="features-grid">
          {FEATURES.map(({ title, desc, icon }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <div>
                <div className="feature-card-title">{title}</div>
                <p className="feature-card-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="features-cta" onClick={scrollToTop}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="features-cta-icon">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          </svg>
          Try the scanner
        </button>
      </section>

      <footer className="landing-footer" aria-labelledby="about-title">
        <div className="footer-brand">
          <img src="/logo.png" alt="" className="footer-logo" />
          <span className="footer-text">
            Who Owns It? · Powered by Detective Lenny © 2026
          </span>
        </div>

        <p id="about-title" className="footer-tagline">
          About the Team.
        </p>

        <p className="footer-credits">
          Built by{" "}
          {TEAM.map(({ name, url }, i) => (
            <span key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-credit-link"
              >
                {name}
              </a>
              {i < TEAM.length - 1 ? (i === TEAM.length - 2 ? ", and " : ", ") : "."}
            </span>
          ))}
        </p>
      </footer>
    </>
  );
}

export default ScanScreen;
