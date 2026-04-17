import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

const OfferDetailPage = () => {
    const { id } = useParams()
    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [applying, setApplying] = useState(false)

    useEffect(() => {
        fetch(`http://localhost:8080/oferta/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Oferta no encontrada')
                return res.json()
            })
            .then(data => {
                setOffer(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    const handleApply = async () => {
        try {
            setApplying(true)
            const response = await fetch(`http://localhost:8080/postulante/1/${id}`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('No se pudo enviar la postulación')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setApplying(false)
        }
    }

    if (loading) return <p>Cargando oferta...</p>
    if (error) return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>
            <p>{error}</p>
        </div>
    )
    if (!offer) return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>
            <p>Oferta no encontrada.</p>
        </div>
    )

    return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>

            <div className="offer-detail__header">
                <span className="offer-detail__company accent">{offer.empresa}</span>
                <h1 className="offer-detail__title">{offer.titulo}</h1>
                <div className="offer-detail__meta">
                    <span className="offer-detail__work-type">{offer.modalidad}</span>
                    <span className="offer-detail__salary accent">${offer.sueldoMin} - ${offer.sueldoMax}</span>
                </div>
            </div>

            <hr className="offer-detail__divider" />

            <div className="offer-detail__body">
                {offer.descripcion
                    ? <ReactMarkdown>{offer.descripcion}</ReactMarkdown>
                    : <p className="offer-detail__no-description">Descripción no disponible.</p>
                }
            </div>

            <button
                type="button"
                className="offer-detail__apply-btn"
                onClick={handleApply}
                disabled={applying}
            >
                {applying ? 'Postulando...' : 'Postularse'}
            </button>
        </div>
    )
}

export default OfferDetailPage