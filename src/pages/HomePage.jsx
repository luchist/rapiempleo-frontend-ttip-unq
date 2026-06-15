import { useState, useEffect, useContext } from 'react'
import SearchBar from '../components/search/SearchBar'
import OfferGrid from '../components/offers/OfferGrid'
import AiLoadingIndicator from '../components/search/AiLoadingIndicator'
import UserContext from '../components/UserProvider'

const KEY_MAP = {
  titulo: 'title',
  empresa: 'company',
  modalidad: 'workType',
  ubicacion: 'location',
}

const HomePage = () => {
  const [query, setQuery] = useState(null)
  const [aiQuery, setAiQuery] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useContext(UserContext);
  const token = localStorage.getItem("token")
  const userStoraged = JSON.parse(localStorage.getItem("user"))

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

  const buildAiSearchUrl = (query) => {
    const urlParams = new URLSearchParams({ query })
    return `http://localhost:8080/ai/context`
  }

  useEffect(() => {
    if (aiQuery !== null) {
      fetch(buildAiSearchUrl(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener la respuesta de IA')
          return res.json()
        })
        .then(data => {
          const parsedQuery = (data?.response || '').trim()
          setSearchInput(parsedQuery)
          setAiQuery(null)
          setAiLoading(false)
          setQuery(parsedQuery)
        })
        .catch(err => {
          setError(err.message)
          setAiLoading(false)
          setLoading(false)
        })
      return
    }
    let url
    if (query !== null) {
      url = buildSearchUrl(query)
    } else if (userStoraged.typeUser) {
      url = `http://localhost:8080/oferta/recuperarOfertasYFavoritos`
    } else {
      url = 'http://localhost:8080/oferta/obtenerOfertas'
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
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
  }, [query, aiQuery, token])


  const handleAiSearch = (value) => {
    setSearchInput(value)
    setAiQuery(value)
    setLoading(true)
    setError(null)
    setAiLoading(true)
  }

  const handleSearch = (value) => {
    setAiQuery(null)
    setSearchInput(value)
    setQuery(value)
    setLoading(true)
    setError(null)
  }

  const handleFavoriteChanged = (offerId, newFavoriteState) => {
    console.log("Updating offer", offerId, newFavoriteState)
    setOffers(prev =>
      prev.map(offer =>
        offer.id === offerId
          ? { ...offer, favorito: newFavoriteState }
          : offer
      )
    )
  }

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        onAiSearch={handleAiSearch}
        inputValue={searchInput}
        onInputChange={setSearchInput}
      />

      {aiLoading && <AiLoadingIndicator />}

      {!aiLoading && (
        <>
          <h2 className='welcome-entry'>Bienvenido, {user?.nombre ?? 'Usuario'}</h2>
          <h2 className="section-title">
            <span className="accent">▍</span>
            Ofertas {query && <span style={{ fontSize: '14px', opacity: 0.4, fontWeight: 'normal' }}>({offers.length} resultados)</span>}
          </h2>
          {loading && <p>Cargando ofertas...</p>}
          {error && <p>Error: {error}</p>}
          {!loading && !error && <OfferGrid offers={offers} changedFavorite={handleFavoriteChanged}/>}
        </>
      )}
    </div>
  )
}

export default HomePage
