const DEFAULT_MESSAGE =
  "Couldn't identify a branded product — try again with the logo or packaging clearly in frame.";

function RetryScreen({ result, onReset }) {
  const message = result?.message || DEFAULT_MESSAGE;

  return (
    <section className="card">
      <p>{message}</p>
      <button type="button" className="primary" onClick={onReset}>
        Scan again
      </button>
    </section>
  );
}

export default RetryScreen;
