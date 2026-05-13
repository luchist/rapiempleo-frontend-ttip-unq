import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCardOfertante from '../components/offers/OfferCardOfertante'

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    const [errorNotif, setErrorNotif] = useState(null)
    const [openedOfferId, setOpenedOfferId] = useState(null)
    const [offersCV, setOffersCV] = useState([]) 

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
                setUser(data)
                setLoading(false)
                setNotify(data.nuevaNotifcacion)
                setNotifs(data.avisosPostulacion)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    if (loading) return <p>Cargando perfil...</p>
    console.log(user.ofertasCreadas)
    return (
        <div>
            {loading && error && 
            <div className='section-name'>
                <h1 className='tile-name'>{error.message}</h1>
            </div>
            }
            <div className="section-name">
                <h1 className="title-name">{user.nombre}</h1>
                <hr className="separation-user" />
                <h1 className="title-name">Empresa : {user.empresa}</h1>
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
                                    <div className="cv-unit-section">{cv}</div>
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
                        {user.ofertasCreadas.map((offer) => (     
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