const OfferCard = ({ title, company, salary, workType }) => {
  return (
    <div className="offer-card">
      <div className="offer-card__header">
        <span className="offer-card__company accent">{company}</span>
        <h3 className="offer-card__title">{title}</h3>
        <h4 className="offer-card__work-type">{workType}</h4>
      </div>
      <span className="offer-card__salary accent">{salary}</span>
    </div>
  )
}

export default OfferCard