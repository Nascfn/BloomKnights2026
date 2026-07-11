import OwnershipChain from "./OwnershipChain";

function PrivateScreen({ result, onReset }) {
  const { ownership_chain: chain, ultimate_parent: ultimateParent, licensing_note: licensingNote, summary } = result;

  return (
    <section className="card">
      <p className="eyebrow">🔒 Privately held</p>
      <h1>Privately held by {ultimateParent}</h1>

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

export default PrivateScreen;
