import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCardOfertante from '../components/offers/OfferCardOfertante'
import CvModal from '../components/CvModal'
import UserContext from '../components/UserProvider'

const BASE_URL = "http://localhost:8080"
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [userOf, setUserOf] = useState(null)
    const [error, setError] = useState(null)

    const [openedOfferId, setOpenedOfferId] = useState(null)
    const [offersCV, setOffersCV] = useState([])

    const [cvModalOpened, setCvModalOpened] = useState(false)
    const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)
    const [cvModalFilename, setCvModalFilename] = useState(null)

    const [profilePicUrl, setProfilePicUrl] = useState(null)
    const [profilePicError, setProfilePicError] = useState(null)
    const profilePicInputRef = useRef(null)

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
                if (data.fotoPerfil) {
                    const filename = data.fotoPerfil.split('/').pop()
                    fetch(`${BASE_URL}/files/fotos/ofertante/${id}/${filename}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .then(r => r.blob())
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
                const filename = data.fotoPath.split('/').pop()
                return fetch(`${BASE_URL}/files/fotos/ofertante/${id}/${filename}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.blob()).then(blob => URL.createObjectURL(blob))
            })
            .then(blobUrl => setProfilePicUrl(blobUrl))
            .catch(() => setProfilePicError('Error al subir la imagen. Intente de nuevo.'))
            .finally(() => { e.target.value = null })
    }

    const handleOpenCV = (id_postulante, cvPath, id_oferta, cvVisto) => {
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

                if (!cvVisto) {
                    return fetch("http://localhost:8080/postulante/cvViewed", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id_postulante: id_postulante,
                            id_oferta: id_oferta,
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
                {profilePicError && <p className="profile-pic__error">{profilePicError}</p>}
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
                            <div>Seleccione un CV para verlo en detalle:</div>
                            <div className="all-cv-section">
                                {offersCV.map((cv) => (
                                    <div className="cv-unit-section"
                                        onClick={() => handleOpenCV(cv.id_postulante, cv.cvPathPostulacion, cv.id_oferta, cv.cvVisto)}>
                                        <div className="temporal-cv-unit-text">
                                            Haga click para ver en detalle el CV :
                                        </div>
                                        <div className="cv-unit-footer">
                                            {cv.cvPathPostulacion.split('/').pop()}
                                        </div>
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
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOfferingPage