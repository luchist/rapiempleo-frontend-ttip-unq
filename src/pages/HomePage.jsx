import { useState, useEffect } from 'react'
import SearchBar from '../components/search/SearchBar'
import OfferGrid from '../components/offers/OfferGrid'

const KEY_MAP = {
  titulo: 'title',
  empresa: 'company',
  modalidad: 'workType',
  ubicacion: 'location',
}

const parseQuery = (query) => {
  if (!query.includes(':')) {
    return { title: query }
  }
  const params = {}
  query.split(',').forEach((part) => {
    const [rawKey, ...rest] = part.split(':')
    const key = rawKey.trim().toLowerCase()
    const value = rest.join(':').trim()
    const mappedKey = KEY_MAP[key]
    if (mappedKey && value) {
      params[mappedKey] = value
    }
  })
  return params
}

const buildSearchUrl = (query) => {
  const params = parseQuery(query)
  const urlParams = new URLSearchParams(params)
  return `http://localhost:8080/search?${urlParams}`
}

const HomePage = () => {
  const [query, setQuery] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const url = query
      ? buildSearchUrl(query)
      : 'http://localhost:8080/oferta/obtenerOfertas'

    fetch(url)
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
  }, [query])

  return (
    <div>
      <SearchBar onSearch={setQuery} />
      <h2 className="section-title">
        <span className="accent">▍</span>
        Ofertas {query && <span style={{ fontSize: '14px', opacity: 0.4, fontWeight: 'normal' }}>({offers.length} resultados)</span>}
      </h2>
      {loading && <p>Cargando ofertas...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && <OfferGrid offers={offers} />}
    </div>
  )
}

export default HomePage