import { useMemo, useState } from 'react'
import SearchBar, { filterOffers } from '../components/search/SearchBar'
import OfferGrid from '../components/offers/OfferGrid'
import offers from '../data/mockOffers'

const HomePage = () => {
  const [search, setSearch] = useState('')

  const filteredOffers = useMemo(() => {
    return filterOffers(offers, search)
  }, [search])

  return (
    <div>
      <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} />
      <h2 class="section-title">
        <span class="accent">▍</span>
        Ofertas
      </h2>
      <OfferGrid offers={filteredOffers} />
    </div>
  )
}

export default HomePage