import { useState, useEffect, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OfferCardOfertante from '../components/offers/OfferCardOfertante'
import CvModal from '../components/CvModal'
import UserContext from '../components/UserProvider'
import ErrorAlert from '../components/alerts/ErrorAlert'
import ErrorAlertPage from '../components/alerts/ErrorAlertPage'

const BASE_URL = "http://localhost:8080"
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const PAGE_SIZE = 4

const UserOfferingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
    const isOwner = user && String(user.id) === id
    const [loading, setLoading] = useState(true)
    const [userOf, setUserOf] = useState(null)
    const [error, setError] = useState(null)

    const [openedOfferId, setOpenedOfferId] = useState(null)
    const [offersCV, setOffersCV] = useState([])
    const [offerSelected, setOfferSelected] = useState(null)

    const [cvModalOpened, setCvModalOpened] = useState(false)
    const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)
    const [cvModalFilename, setCvModalFilename] = useState(null)

    const [profilePicUrl, setProfilePicUrl] = useState(null)
    const [profilePicError, setProfilePicError] = useState(null)
    const [errorCVOpen, setErrorCVOpen] = useState(null)
    const [errorActionCV, setErrorActionCV] = useState(null)
    const [page, setPage] = useState(0)
    const [errorToggleEstado, setErrorToggleEstado] = useState(null)
    const profilePicInputRef = useRef(null)

    useEffect(() => {
        return () => { if (profilePicUrl) URL.revokeObjectURL(profilePicUrl) }
    }, [profilePicUrl])

    const token = localStorage.getItem("token")

    const offersInDisplay = () => {
        return userOf.ofertasCreadas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    }


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
                if (data.fotoPerfil) {
                    const url = `${BASE_URL}/files/fotos/${data.fotoPerfil}`
                    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => {
                            if (!r.ok) throw new Error('No se pudo cargar la imagen de perfil')
                            return r.blob()
                        })
                        .then(blob => setProfilePicUrl(URL.createObjectURL(blob)))
                        .catch(() => { })
                }
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id, token])

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
            setProfilePicError('Solo se permiten archivos JPG o PNG de hasta 5 MB.')
            e.target.value = null
            return
        }
        setProfilePicError(null)
        const formData = new FormData()
        formData.append('file', file)
        fetch(`${BASE_URL}/ofertante/${id}/foto`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
        .then(res => { if (!res.ok) throw new Error(); return res.json() })
        .then(data => {
            const url = `${BASE_URL}/files/fotos/${data.fotoPath}`
            return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => {
                    if (!r.ok) throw new Error('No se pudo cargar la imagen de perfil')
                    return r.blob()
                })
                .then(blob => URL.createObjectURL(blob))
        })
        .then(blobUrl => setProfilePicUrl(blobUrl))
        .catch(() => setProfilePicError('Error al subir la imagen. Intente de nuevo.'))
        .finally(() => { e.target.value = null })
    }

    const handleOpenCV = (id_postulante, cvPath, id_oferta, estadoCv) => {
        setErrorCVOpen(null)
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
                setErrorCVOpen(err.message)
            })
    }

    const handleCloseModal = () => {
        if (cvModalBlobUrl) URL.revokeObjectURL(cvModalBlobUrl)
        setCvModalOpened(false)
        setCvModalBlobUrl(null)
        setCvModalFilename(null)
    }

    const handleToggleEstado = (offerId) => {
        setErrorToggleEstado(null)
        fetch(`${BASE_URL}/ofertante/${id}/oferta/${offerId}/estado`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cambiar el estado de la oferta')
                return res.json()
            })
            .then(updatedOffer => {
                setUserOf(prev => ({
                    ...prev,
                    ofertasCreadas: prev.ofertasCreadas.map(o =>
                        o.id === updatedOffer.id ? { ...o, estado: updatedOffer.estado } : o
                    )
                }))
            })
            .catch(err => setErrorToggleEstado(err.message))
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
                if (!res.ok) throw new Error('No se pudo procesar la acción en el CV seleccionado')
                return res
            })
            .then(() => {
                const modifiedCvs =
                    offersCV.map(cv => (cv.id_oferta == id_oferta && cv.id_postulante == id_postulante) ?
                        { ...cv, estadoCv: estadoCv }
                        : cv)
                setOffersCV(modifiedCvs)
            })
            .catch(err => {
                setErrorActionCV(err.message)
            })
    }

    const handlePreviousPage = () => {
        if (page != 0) {
            setPage(page - 1)
        }
    }

    const handleNextPage = () => {
        if (PAGE_SIZE * (page + 1) < userOf.ofertasCreadas.length) {
            setPage(page + 1)
        }
    }

    if (loading) return <p>Cargando perfil...</p>
    if (error) return <ErrorAlertPage textForError={error}/>
    return (
        <div>
            <div className="offerer-profile__alerts-wrapper">
              {profilePicError ? <ErrorAlert textForError={profilePicError} page="offerer"
                onAlertClose={() => setProfilePicError(null)}/> : <></>}
              {errorCVOpen ? <ErrorAlert textForError={errorCVOpen} page="offerer"
                onAlertClose={() => setErrorCVOpen(null)}/> : <></>}
              {errorActionCV ? <ErrorAlert textForError={errorActionCV} page="offerer"
                onAlertClose={() => setErrorActionCV(null)}/> : <></>}
              {errorToggleEstado ? <ErrorAlert textForError={errorToggleEstado} page="offerer" 
                onAlertClose={() => setErrorToggleEstado(null)}/>: <></>}
            </div>
            {cvModalOpened && (
                <CvModal
                    blobUrl={cvModalBlobUrl}
                    filename={cvModalFilename}
                    onClose={handleCloseModal}
                />
            )}

            <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={profilePicInputRef}
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
            />

            <div className="section-name">
                <div className="postulant-profile__avatar">
                    {profilePicUrl && <img src={profilePicUrl} className="profile-pic__img" alt="Imagen de perfil" />}
                    {(
                        <button
                            className="profile-pic__overlay"
                            onClick={() => profilePicInputRef.current.click()}
                            aria-label="Subir imagen de perfil"
                            title="Subir imagen de perfil (JPG, JPEG, PNG)"
                        >
                            <span className="profile-pic__label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M12 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M19 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M2 13.3636C2 10.2994 2 8.76721 2.74902 7.6666C3.07328 7.19014 3.48995 6.78104 3.97524 6.46268C4.69555 5.99013 5.59733 5.82123 6.978 5.76086C7.63685 5.76086 8.20412 5.27068 8.33333 4.63636C8.52715 3.68489 9.37805 3 10.3663 3H13.6337C14.6219 3 15.4728 3.68489 15.6667 4.63636C15.7959 5.27068 16.3631 5.76086 17.022 5.76086C18.4027 5.82123 19.3044 5.99013 20.0248 6.46268C20.51 6.78104 20.9267 7.19014 21.251 7.6666C22 8.76721 22 10.2994 22 13.3636C22 16.4279 22 17.9601 21.251 19.0607C20.9267 19.5371 20.51 19.9462 20.0248 20.2646C18.9038 21 17.3433 21 14.2222 21H9.77778C6.65675 21 5.09624 21 3.97524 20.2646C3.48995 19.9462 3.07328 19.5371 2.74902 19.0607C2.53746 18.7498 2.38566 18.4045 2.27673 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                                </svg>
                            </span>
                        </button>
                    )}
                </div>
                <div className="name-section">
                    <h1 className="title-name">{userOf.nombre}</h1>
                </div>
                <div className="separation-user"></div>
                <div className="company-section">
                    <h1 className="title-name">Empresa : {userOf.empresa}</h1>
                </div>
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
                                        <div className={`cv-document ${cv.estadoCv || "ESPERA"}`}
                                            onClick={() => handleOpenCV(cv.id_postulante, cv.cvPathPostulacion, cv.id_oferta, cv.estadoCv)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" display="block"
                                                width="137" height="170" viewBox="3.8 7.5 17 8.3" fill="#646464c0" 
                                                strokeWidth="0.38" strokeLinecap="round" strokeLinejoin="round"
                                                fontWeight="300"
                                                className="cv-svg lucide lucide-file-icon lucide-file">
                                                <path d="M6 22 H4 V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8 V22 Z"/>
                                                <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                                            </svg>
                                            <span className="cv-name">
                                                {cv.cvPathPostulacion.split('/').pop()}
                                            </span>
                                            <span className='cv-label-tooltip'>
                                                Haga click para ver el CV en detalle
                                            </span>
                                        </div>
                                        {cv.estadoCv == "RECHAZADO" || cv.estadoCv == "CONSIDERACION" ?
                                            <div className="cv-unit-buttons-section">
                                                <button className="cv-unit-button-unique" disabled={true}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round"
                                                        className="lucide lucide-info-icon lucide-info">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M12 16v-4" />
                                                        <path d="M12 8h.01" />
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
                                                        className="lucide lucide-file-check-icon lucide-file-check">
                                                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                                        <path d="m9 15 2 2 4-4" />
                                                    </svg>
                                                    <span className="tooltip-cv-button">Marcar como posible candidato</span>
                                                </button>
                                                <button className="cv-unit-button cross" onClick={() => handleActionOnCV(cv.id_postulante, cv.id_oferta, "RECHAZADO")}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none"
                                                        stroke="#0b0a0a" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round"
                                                        className="lucide lucide-clipboard-x-icon lucide-clipboard-x">
                                                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                                        <path d="m15 11-6 6" /><path d="m9 11 6 6" />
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
                        {isOwner && (
                            <button
                                className='create-offer-button'
                                onClick={() => navigate(`/ofertante/${id}/create-oferta`)}
                            >
                                Crear nueva oferta
                            </button>
                        )}
                    </div>
                    <div className="list-created-offers">
                        {offersInDisplay().map((offer) => (
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
                                estado={offer.estado}
                                isOwner={isOwner}
                                onToggleEstado={() => handleToggleEstado(offer.id)}
                            />
                        ))}
                        
                    </div>
                    <div className="offers-pagination-arrows">
                      <button className="offers-pagination-arrow left-arrow" 
                        onClick={() => handlePreviousPage()} disabled={page == 0}>
                        ◀
                      </button>
                      <button className="offers-pagination-arrow right-arrow" 
                        onClick={() => handleNextPage()} disabled={PAGE_SIZE * (page + 1) >= userOf.ofertasCreadas.length}>
                        ▶
                      </button>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default UserOfferingPage