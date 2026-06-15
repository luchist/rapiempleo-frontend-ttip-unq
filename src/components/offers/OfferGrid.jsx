import OfferCard from './OfferCard'
import { Link } from 'react-router-dom'

const OfferGrid = ({ offers, changedFavorite }) => {
  return (
    <div className="offer-grid">
      {offers.map((offer) => (
        <Link to={`/ofertas/${offer.id}`} key={offer.id}>
          <OfferCard
            id={offer.id}
            title={offer.titulo}
            company={offer.empresa}
            workType={offer.modalidad}
            location={offer.ubicacion}
            salaryMin={offer.sueldoMin}
            salaryMax={offer.sueldoMax}
            favorite={offer.favorito}
            changedFavorite={changedFavorite}
          />
        </Link>
      ))}
    </div>
  )
}

export default OfferGrid