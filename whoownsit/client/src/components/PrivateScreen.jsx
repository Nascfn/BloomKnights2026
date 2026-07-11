function PrivateScreen({ result, onReset }) {
  const { ownership_chain: chain, ultimate_parent: ultimateParent, licensing_note: licensingNote, summary } = result;

  return (
    <section className="card">
      <p className="eyebrow">🔒 Privately held</p>
      <h1>Privately held by {ultimateParent}</h1>

      <div>
        {chain.map((name, index) => (
          <span
            key={name}
            className={index === chain.length - 1 ? "pill pill-final" : "pill"}
          >
            {name}
          </span>
        ))}
      </div>

      {licensingNote && (
        <div>
          <span className="pill">{licensingNote}</span>
        </div>
      )}

      <p>{summary}</p>

      <button type="button" className="primary" onClick={onReset}>
        Scan another product
      </button>
    </section>
  );
}

export default PrivateScreen;
