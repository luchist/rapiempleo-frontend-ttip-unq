import { useState, useEffect, useRef, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import ConfirmationAlert from '../components/alerts/ConfirmationAlert'

import UserContext from '../components/UserProvider'
import ErrorAlertPage from '../components/alerts/ErrorAlertPage'

const OfferDetailPage = () => {
    const { id } = useParams()
    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [applying, setApplying] = useState(false)

    const [hasApplied, setHasApplied] = useState(false)
    const [particles, setParticles] = useState([])
    const [stateFavorite, setStateFavorite] = useState(null)
    const btnRef = useRef(null)
    const [showConfirmButton, setShowConfirmButton] = useState(false)

    const token = localStorage.getItem("token");
    const { user } = useContext(UserContext);

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch(`http://localhost:8080/oferta/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Oferta no encontrada o inexistente')
                return res.json()
            })
            .then(data => {
                setOffer(data)
                setStateFavorite(data.favorito)
                setHasApplied(data.yaPostulado)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id, token])

    useEffect(() => {
        if (showConfirmButton) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.body.style.overflow = ""
        }
    }, [showConfirmButton])

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


    const handleFavorite = () => {
    if (stateFavorite) {
      fetch(`http://localhost:8080/postulante/removeFavorito/${user.id}/${offer.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No pudo sacar favorito a la oferta')
        return res.text()
      })
      .then(
        setStateFavorite(false)
      )
      .catch(err => {
        setError(err.message)
      })

    } else {

      fetch(`http://localhost:8080/postulante/addFavorito/${user.id}/${offer.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No pudo dar favorito a la oferta')
        return res.text()
      })
      .then(
        setStateFavorite(true)
      )
      .catch(err => {
        setError(err.message)
      })
    }
    }

    const handleApplyConfirm = async () => {
        spawnParticles()
        try {
            setApplying(true)
            const response = await fetch(`http://localhost:8080/postulante/${user.id}/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (response.status === 400) {
                throw new Error('Necesitas cargar un CV para postularte a esta oferta')
            }

            if (!response.ok) {
                throw new Error('No se pudo enviar la postulación')
            }
            setHasApplied(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setApplying(false)
            setShowConfirmButton(false)
        }
    }

    const handleCancel = () => {
        setShowConfirmButton(false)
        setLoading(false)
        setError(null)
    }


    if (loading) return <p>Cargando oferta...</p>
    if (error) return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>
            <ErrorAlertPage textForError={error}/>
        </div>
    )
    if (!offer) return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>
            <ErrorAlertPage textForError={error}/>
        </div>
    )

    return (
        <div className="offer-detail">
            <Link to="/" className="offer-detail__back">← Volver</Link>
            {showConfirmButton ? 
                <ConfirmationAlert 
                    questionMessage="¿Esta seguro que desea postularse en esta oferta?"
                    onConfirm={handleApplyConfirm}
                    onCancel={handleCancel}
                    page="offer"
                /> 
                :
                <></>
            }
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
                    ? <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{offer.descripcion}</ReactMarkdown>
                    : <p className="offer-detail__no-description">Descripción no disponible.</p>
                }
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px'}}>
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
                        className={`offer-detail__apply-btn${hasApplied || offer.estado === 'Cerrado' ? ' offer-detail__apply-btn--applied' : ''
                            }`}
                        onClick={() => setShowConfirmButton(true)}
                        disabled={applying || hasApplied || offer.estado === 'Cerrado'}
                    >
                        {applying || showConfirmButton ? 'Enviando...' : hasApplied ? '✓ Enviado' : offer.estado === 'Cerrado' ? 'Oferta cerrada' : 'Postularse'}
                    </button>
                </div>
                <button className={`offer-detail__favorite ${user.typeUser ? "favorite-pointer" : "favorite-hidden"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleFavorite();
                    }}>
                    <svg fill={stateFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default OfferDetailPage