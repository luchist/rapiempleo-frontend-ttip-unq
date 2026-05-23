import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCardOfertante from '../components/offers/OfferCardOfertante'
import CvModal from '../components/CvModal'
import UserContext from '../components/UserProvider';

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [userOf, setUserOf] = useState(null)
    const [error, setError] = useState(null)
    const [errorNotif, setErrorNotif] = useState(null)
    const [openedOfferId, setOpenedOfferId] = useState(null)
    const [offersCV, setOffersCV] = useState([]) 

    const [cvModalOpened, setCvModalOpened] = useState(false)
    const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)

    const { user } = useContext(UserContext);

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
                setNotify(data.nuevaNotifcacion)
                setNotifs(data.avisosPostulacion)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    const handleOpenCV = (id_postulante, cvPath, id_oferta, cvVisto) => {
        const filename = cvPath.split('/').pop()
        const url = `http://localhost:8080/files/cvs/${id_postulante}/${filename}`
        console.log(url)
        fetch(url, { 
            headers: { Authorization: `Bearer ${token}` 
        }})
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar el CV')
            return res.blob()
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob)
            setCvModalOpened(true)
            setCvModalBlobUrl(blobUrl)
            
            if (!cvVisto){
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
    }

    if (loading) return <p>Cargando perfil...</p>
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