import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import OfferCard from '../components/offers/OfferCard'

const UserOfferingPage = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [notify, setNotify] = useState()
    const [user, setUser] = useState(null)
    const [offers, setOffers] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`http://localhost:8080/ofertante/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Ofertante no encontrado')
                return res.json()
            })
            .then(data => {
                setUser(data)
                setLoading(false)
                setNotify(data.nuevaNotifcacion)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    if (loading) return <p>Cargando perfil...</p>
    return (
        <div>
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
                            {user.avisoNuevaOferta}
                        </div>
                        :
                        <div className="section-all-notifications">
                            {user.avisoNuevaOferta}
                        </div>}
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
                                false
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOfferingPage