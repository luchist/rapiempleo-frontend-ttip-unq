import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCard from '../components/offers/OfferCard'

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [notify, setNotify] = useState()
    const [notifs, setNotifs] = useState([])
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null)
    const [errorNotif, setErrorNotif] = useState(null)

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

    const handleDeleteNotify = (indexRemove) => {
        const notifsMod = notifs.filter((_, i) => i !== indexRemove)
        setNotifs(notifsMod)
        console.log(`Que se envia por index: ${indexRemove}`)
        if (notifsMod.length == 0) {
            setNotify(false)
        }
        fetch(`http://localhost:8080/ofertante/deleteNotify/${user.id}/${indexRemove}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(res => {
            if (!res.ok) throw new Error('No se pudo borrar la notificación')
            return res.json()
        })
        .catch(err => {
            setError(err.message)
        })
    }

    if (loading) return <p>Cargando perfil...</p>
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
            <div className="grid-notification-offer">
                <div className="section-notification">
                    <h2 className="title-notifitcation">Notifaciones disponibles</h2>
                    {!notify ?
                        <div className="section-no-notifications">
                            <span className="das">No hay nuevas notificaciones</span>
                        </div>
                        :
                        <div className="section-all-notifications">
                            {notifs.map((notificacion, index) => (
                                <div key={index} className="offer-notification">
                                    <div className='first-line-notification'>
                                        <span>Tiene un nuevo CV en su oferta:</span>
                                        <button className="button-delete-notify" onClick={() => handleDeleteNotify(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round"
                                                class="lucide lucide-square-x-icon lucide-square-x">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                <path d="m15 9-6 6" /><path d="m9 9 6 6" />
                                            </svg>
                                        </button>
                                    </div>
                                    <span style={{ fontWeight: "bolder" }}>{notificacion}</span>
                                </div>
                            ))}

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
                            <OfferCard className="offer-create-card" key={offer.id}
                                title={offer.titulo}
                                company={offer.empresa}
                                workType={offer.modalidad}
                                location={offer.ubicacion}
                                salaryMin={offer.sueldoMin}
                                salaryMax={offer.sueldoMax}
                                favorite={false}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOfferingPage