import OwnershipChain from "./OwnershipChain";
import CompanyCard from "./CompanyCard";
import PriceChart from "./PriceChart";
import DcaCalculator from "./DcaCalculator";

function ResultScreen({ result, onReset }) {
  return (
    <section className="card">
      <p className="eyebrow">You scanned</p>
      <h1>{result.product_name}</h1>

      <OwnershipChain chain={result.ownership_chain} />

      {result.licensing_note && (
        <div>
          <span className="pill">{result.licensing_note}</span>
        </div>
      )}

      <p>{result.summary}</p>

      <CompanyCard company={result.company} sharePrice={result.share_price} asOf={result.as_of} />

      <h2>Last 12 months · {result.ticker}</h2>
      <PriceChart chart={result.chart} />

      <DcaCalculator
        monthlyBuys={result.monthly_buys}
        sharePrice={result.share_price}
        initialMonthly={result.dca?.monthly_amount}
      />

      <button type="button" className="primary" onClick={onReset}>
        Scan another product
      </button>
    </section>
  );
}

export default ResultScreen;
