import { useParams, Link } from 'react-router-dom'
import offers from '../data/mockOffers'
import ReactMarkdown from 'react-markdown' 

const OfferDetailPage = () => {
    const { id } = useParams()
    const offer = offers.find(o => o.id === Number(id))

    if (!offer) {
        return (
            <div className="offer-detail">
                <Link to="/" className="offer-detail__back">← Volver</Link>
                <p>Oferta no encontrada.</p>
            </div>
        )
    }

    return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>

            <div className="offer-detail__header">
                <span className="offer-detail__company accent">{offer.company}</span>
                <h1 className="offer-detail__title">{offer.title}</h1>
                <div className="offer-detail__meta">
                    <span className="offer-detail__work-type">{offer.workType}</span>
                    <span className="offer-detail__salary accent">{offer.salaryMin} - {offer.salaryMax}</span>
                </div>
            </div>

            <hr className="offer-detail__divider" />

            <div className="offer-detail__body">
                {offer.description
                    ? <ReactMarkdown>{offer.description}</ReactMarkdown>
                    : <p className="offer-detail__no-description">Descripción no disponible.</p>
                }
            </div>

            <button type="button" className="offer-detail__apply-btn">Postularse</button>
        </div>
    )
}

export default OfferDetailPage