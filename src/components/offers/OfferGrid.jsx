import OfferCard from './OfferCard'
import { Link } from 'react-router-dom'

const OfferGrid = ({ offers }) => {
  return (
    <div className="offer-grid">
      {offers.map((offer) => (
        <Link to={`/ofertas/${offer.id}`} key={offer.id}>
          <OfferCard
            title={offer.title}
            company={offer.company}
            salaryMin={offer.salaryMin}
            salaryMax={offer.salaryMax}
            workType={offer.workType}
            favorite={offer.favorite}
          />
        </Link>
      ))}
    </div>
  )
}

export default OfferGrid