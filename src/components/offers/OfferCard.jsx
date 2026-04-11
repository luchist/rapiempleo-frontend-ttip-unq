const OfferCard = ({ title, company, salaryMin, salaryMax, workType, favorite }) => {
  return (
    <div className="offer-card">
      <div className="offer-card__header">
        <span className="offer-card__company accent">{company}</span>
        <h3 className="offer-card__title">{title}</h3>
        <h4 className="offer-card__work-type">{workType}</h4>
      </div>
      <div className="offer-card__footer">
        <span className="offer-card__salary accent">
          ${salaryMin} - ${salaryMax}
        </span>
        <span className="offer-card__favorite">
            <svg fill={favorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </span>
      </div>
    </div>
  )
}

export default OfferCard