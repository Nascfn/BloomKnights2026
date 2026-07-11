function ForeignScreen({ result, onReset }) {
  const {
    ownership_chain: chain,
    ultimate_parent: ultimateParent,
    country,
    licensing_note: licensingNote,
    summary,
  } = result;

  return (
    <section className="card">
      <p className="eyebrow">🌍 Not US-listed</p>
      <h1>
        {ultimateParent} is not US-listed ({country})
      </h1>

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

export default ForeignScreen;
