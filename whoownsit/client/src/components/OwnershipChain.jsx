function OwnershipChain({ chain }) {
  return (
    <div className="ownership-chain">
      {chain.map((name, index) => (
        <span key={name} className="ownership-chain-link">
          <span className={index === chain.length - 1 ? "pill pill-final" : "pill"}>
            {name}
          </span>
          {index < chain.length - 1 && <span aria-hidden="true"> → </span>}
        </span>
      ))}
    </div>
  );
}

export default OwnershipChain;
