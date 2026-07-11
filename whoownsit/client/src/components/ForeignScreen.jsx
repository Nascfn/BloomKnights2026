import OwnershipChain from "./OwnershipChain";

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

      <OwnershipChain chain={chain} />

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
