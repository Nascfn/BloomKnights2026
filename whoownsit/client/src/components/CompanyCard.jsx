import { useState } from "react";

function CompanyCard({ company, sharePrice, asOf }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = company.logo_url && !logoFailed;

  return (
    <div className="company-card">
      <div className="company-card-identity">
        {showLogo ? (
          <img
            src={company.logo_url}
            alt={`${company.company_name} logo`}
            className="company-logo"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className="company-logo company-logo-fallback" aria-hidden="true">
            {company.company_name.charAt(0)}
          </div>
        )}
        <div>
          <p className="company-name">{company.company_name}</p>
          <p className="company-meta">
            {company.sector} · {company.exchange}
          </p>
        </div>
      </div>

      <div className="company-price">
        <p className="company-price-big">${sharePrice.toFixed(2)}</p>
        <p className="company-price-date">as of {asOf}</p>
      </div>
    </div>
  );
}

export default CompanyCard;
