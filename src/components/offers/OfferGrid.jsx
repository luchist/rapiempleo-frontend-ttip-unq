import offers from '../../data/mockOffers'
import OfferCard from './OfferCard'

const OfferGrid = () => {
  return (
    <div className="offer-grid">
      {offers.map((offer) => (
        <OfferCard
          key={offer.title}
          title={offer.title}
          company={offer.company}
          salary={offer.salary}
          workType={offer.workType}
        />
      ))}
    </div>
  )
}

export default OfferGrid