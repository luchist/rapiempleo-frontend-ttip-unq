import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCardOfertante from '../components/offers/OfferCardOfertante'
import CvModal from '../components/CvModal'

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [userOf, setUserOf] = useState(null)
    const [error, setError] = useState(null)

    const [openedOfferId, setOpenedOfferId] = useState(null)
    const [offersCV, setOffersCV] = useState([])
    const [offerSelected, setOfferSelected] = useState(null)

    const [cvModalOpened, setCvModalOpened] = useState(false)
    const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)
    const [cvModalFilename, setCvModalFilename] = useState(null)

    const token = localStorage.getItem("token")

    useEffect(() => {
        fetch(`http://localhost:8080/ofertante/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Ofertante no encontrado')
                return res.json()
            })
            .then(data => {
                setUserOf(data)
                setLoading(false)

            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id, token])

    const handleOpenCV = (id_postulante, cvPath, id_oferta, estadoCv) => {
        const filename = cvPath.split('/').pop()
        const url = `http://localhost:8080/files/cvs/${id_postulante}/${filename}`
        console.log(url)
        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar el CV')
                return res.blob()
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob)
                setCvModalOpened(true)
                setCvModalBlobUrl(blobUrl)
                setCvModalFilename(filename)

                if (estadoCv == "ESPERA") {
                    return fetch("http://localhost:8080/postulante/respuestaCV", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id_postulante: id_postulante,
                            id_oferta: id_oferta,
                            tipo_aviso: "VISTO"
                        })
                    })
                }
            })
            .catch((err) => {
                console.error(err)
            })
    }

    const handleCloseModal = () => {
        if (cvModalBlobUrl) URL.revokeObjectURL(cvModalBlobUrl)
        setCvModalOpened(false)
        setCvModalBlobUrl(null)
        setCvModalFilename(null)
    }

    const handleActionOnCV = (id_postulante, id_oferta, estadoCv) => {
        console.log()
        fetch(`http://localhost:8080/postulante/respuestaCV`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_postulante: id_postulante,
                id_oferta: id_oferta,
                tipo_aviso: estadoCv
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Accion en CV no pudo ser procesada')
            return res
        })
        .then(res => {
            const modifiedCvs = 
                offersCV.map(cv => (cv.id_oferta == id_oferta && cv.id_postulante == id_postulante) ? 
                    { ...cv, estadoCv : estadoCv }
                : cv)
            setOffersCV(modifiedCvs)
        })
        .catch(err => {
            setError(err.message)
        })
    }

    if (loading) return <p>Cargando perfil...</p>
    if (error) return <p>Error: {error}</p>
    return (
        <div>
            {loading && error && 
            <div className='section-name'>
                <h1 className='title-name'>{error.message}</h1>
            </div>
            }
            {cvModalOpened && (
                <CvModal
                    blobUrl={cvModalBlobUrl}
                    filename={cvModalFilename}
                    onClose={handleCloseModal}
                />
            )}
            <div className="section-name">
                <h1 className="title-name">{userOf.nombre}</h1>
                <hr className="separation-user" />
                <h1 className="title-name">Empresa : {userOf.empresa}</h1>
            </div>
            <div className="grid-cv-visor-offer">
                <div className="section-visor">
                    <h2 className="title-cv-visor">Visor de CVs postulantes</h2>
                    {openedOfferId == null ?
                        <div className="section-cv-visor-closed">
                            <span className="">Seleccione una oferta para visualizar los CVs disponibles {"->"}</span>
                        </div>
                        :
                        <div className="section-cv-visor-opened">
                            <div>Viendo CVs de oferta: {offerSelected}</div>
                            <div className="all-cv-section">
                                {offersCV.map((cv) => (
                                    <div className="cv-unit-wrapper">
                                        <div className={`cv-unit-section ${cv.estadoCv}`}
                                            onClick={() => handleOpenCV(cv.id_postulante, cv.cvPathPostulacion, cv.id_oferta, cv.estadoCv)}>
                                            <div className="temporal-cv-unit-text">
                                                Haga click para ver en detalle el CV :
                                            </div>
                                            <div className="cv-unit-footer">
                                                {cv.cvPathPostulacion.split('/').pop()}
                                            </div>
                                        </div>
                                        {cv.estadoCv == "RECHAZADO" || cv.estadoCv == "CONSIDERACION" ?
                                        <div className="cv-unit-buttons-section">
                                            <button className="cv-unit-button-unique" disabled={true}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                                                    viewBox="0 0 24 24" fill="none" 
                                                    stroke="currentColor" strokeWidth="2" 
                                                    strokeLinecap="round" strokeLinejoin="round" 
                                                    class="lucide lucide-info-icon lucide-info">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 16v-4"/>
                                                    <path d="M12 8h.01"/>
                                                </svg>
                                                <span className="tooltip-cv-button unique">Futura acción a definir</span>
                                            </button>
                                        </div>
                                        :
                                        <div className="cv-unit-buttons-section">
                                            <button className="cv-unit-button tick" onClick={() => handleActionOnCV(cv.id_postulante, cv.id_oferta, "CONSIDERACION")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                                                    viewBox="0 0 24 24" fill="none" 
                                                    stroke="#0b0a0a" strokeWidth="2" 
                                                    strokeLinecap="round" strokeLinejoin="round" 
                                                    class="lucide lucide-file-check-icon lucide-file-check">
                                                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
                                                    <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                                                    <path d="m9 15 2 2 4-4"/>
                                                </svg>
                                                <span className="tooltip-cv-button">Marcar como posible candidato</span>
                                            </button>
                                            <button className="cv-unit-button cross" onClick={() => handleActionOnCV(cv.id_postulante, cv.id_oferta, "RECHAZADO")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                                                    viewBox="0 0 24 24" fill="none" 
                                                    stroke="#0b0a0a" strokeWidth="2" 
                                                    strokeLinecap="round" strokeLinejoin="round" 
                                                    class="lucide lucide-clipboard-x-icon lucide-clipboard-x">
                                                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                                    <path d="m15 11-6 6"/><path d="m9 11 6 6"/>
                                                </svg> 
                                                <span className="tooltip-cv-button">Descartar como candidato</span>  
                                            </button>
                                        </div>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
                <div className="section-offers">
                    <div className="offers-header">
                        <h2 className="title-offers">Ofertas creadas</h2>
                        <button className='create-offer-button'>
                            Crear nueva oferta
                        </button>
                    </div>
                    <div className="list-created-offers">
                        {userOf.ofertasCreadas.map((offer) => (
                            <OfferCardOfertante className="offer-create-card" key={offer.id}
                                id={offer.id}
                                title={offer.titulo}
                                company={offer.empresa}
                                workType={offer.modalidad}
                                location={offer.ubicacion}
                                salaryMin={offer.sueldoMin}
                                salaryMax={offer.sueldoMax}
                                postulantes={offer.cvsRecibidos}
                                idOpened={openedOfferId}
                                setIdOpened={setOpenedOfferId}
                                setCVs={setOffersCV}
                                setOfferName={() => setOfferSelected(offer.titulo)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOfferingPage