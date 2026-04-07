import SearchBar from '../components/search/SearchBar'
import OfferGrid from '../components/offers/OfferGrid'

const HomePage = () => {
  return (
    <div>
      <h1>Ofertas</h1>
      <SearchBar />
      <OfferGrid />
    </div>
  )
}

export default HomePage