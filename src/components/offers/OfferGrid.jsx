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
            workType={offer.workType}
            location={offer.location}
            salaryMin={offer.salaryMin}
            salaryMax={offer.salaryMax}
            favorite={offer.favorite}
          />
        </Link>
      ))}
    </div>
  )
}

export default OfferGrid