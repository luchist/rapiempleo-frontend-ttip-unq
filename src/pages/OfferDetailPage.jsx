import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

const OfferDetailPage = () => {
    const { id } = useParams()
    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [applying, setApplying] = useState(false)

    const [hasApplied, setHasApplied] = useState(false)
    const [particles, setParticles] = useState([])
    const btnRef = useRef(null)

    useEffect(() => {
        fetch(`http://localhost:8080/oferta/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Oferta no encontrada')
                return res.json()
            })
            .then(data => {
                setOffer(data)
                setHasApplied(data.yaPostulado)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    const spawnParticles = () => {
        const count = 8
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 80,
        }))
        setParticles(newParticles)
        setTimeout(() => setParticles([]), 3200)
    }

    const handleApply = async () => {
        spawnParticles()
        try {
            setApplying(true)
            const response = await fetch(`http://localhost:8080/postulante/1/${id}`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('No se pudo enviar la postulación')
            }
            setHasApplied(true)
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

            {/* Contenedor relativo para que las partículas se posicionen respecto al btn */}
            <div style={{ position: 'relative', width: 'fit-content' }}>
                {particles.map(p => (
                    <span
                        key={p.id}
                        className="apply-particle"
                        style={{
                            '--tx': `${p.x}px`,
                            '--ty': `${p.y}px`,
                        }}
                    />
                ))}
                <button
                    ref={btnRef}
                    type="button"
                    className={`offer-detail__apply-btn${hasApplied ? ' offer-detail__apply-btn--applied' : ''
                        }`}
                    onClick={handleApply}
                    disabled={applying || hasApplied}
                >
                    {applying ? 'Enviando...' : hasApplied ? '✓ Enviado' : 'Postularse'}
                </button>
            </div>
        </div>
    )
}

export default OfferDetailPage