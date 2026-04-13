import { useState, useEffect } from 'react'
import SearchBar from '../components/search/SearchBar'
import OfferGrid from '../components/offers/OfferGrid'

const HomePage = () => {
  const [search, setSearch] = useState('')
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8080/oferta/obtenerOfertas')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener las ofertas')
        return res.json()
      })
      .then(data => {
        setOffers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  //const filteredOffers = filterOffers(offers, search)

  if (loading) return <p>Cargando ofertas...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} />
      <h2 className="section-title">
        <span className="accent">▍</span>
        Ofertas
      </h2>
      <OfferGrid offers={offers} />
    </div>
  )
}

export default HomePage