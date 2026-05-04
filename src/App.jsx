import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import OfferDetailPage from './pages/OfferDetailPage'
import UserOfferingPage from './pages/UserOfferingPage'
import LoginPage from './pages/LoginPage'
import { UserProvider } from './components/UserProvider'
import UserPostulantPage from './pages/UserPostulantPage'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LoginPage />}/>
            <Route path="home" element={<HomePage />} />
            <Route path="ofertas/:id" element={<OfferDetailPage />} />
            <Route path="ofertante/:id" element={<UserOfferingPage />}/>
            <Route path="postulante/:id" element={<UserPostulantPage />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App

/*
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login/Login.js";
import Register from "./pages/Register/Register.js";
import Home from "./pages/Home/Home.js";
import User from "./pages/User.js";
import UserProfile from "./pages/UserProfile/UserProfile.js";
import { UserProvider } from "./components/UserContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/user" element={<User />} />
          <Route path="/profile/:id" element={<UserProfile />} />
        </Routes>
      </Router>
    </UserProvider>
  </React.StrictMode>
);


*/