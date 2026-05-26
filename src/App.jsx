import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import OfferDetailPage from './pages/OfferDetailPage'
import UserOfferingPage from './pages/UserOfferingPage'
import PostulantProfilePage from './pages/PostulantProfilePage'
import LoginPage from './pages/LoginPage'
import { UserProvider } from './components/UserProvider'
import BoardPage from './pages/BoardPage'
import OfertanteRegisterPage from './pages/OfertanteRegisterPage'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LoginPage />}/>
            <Route path="home" element={<HomePage />}/>
            <Route path="register" element={<OfertanteRegisterPage />}/>
            <Route path="ofertas/:id" element={<OfferDetailPage />}/>
            <Route path="ofertante/:id" element={<UserOfferingPage />}/>
            <Route path="postulante/:id" element={<PostulantProfilePage />}/>
            <Route path="postulante/:id/board" element={<BoardPage />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App