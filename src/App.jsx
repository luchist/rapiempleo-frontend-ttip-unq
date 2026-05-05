import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import OfferDetailPage from './pages/OfferDetailPage'
import UserOfferingPage from './pages/UserOfferingPage'
import PostulantProfilePage from './pages/PostulantProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="ofertas/:id" element={<OfferDetailPage />} />
          <Route path="ofertante/:id" element={<UserOfferingPage />}/>
          <Route path="postulante/:id" element={<PostulantProfilePage />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App