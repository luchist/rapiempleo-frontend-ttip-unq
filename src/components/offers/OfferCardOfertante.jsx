
import { Link, useNavigate } from "react-router-dom";
import "./OfferCardOfertante.css";


const OfferCardOfertante = ({ id, title, company, workType, location, salaryMin, salaryMax, postulantes, 
    cvsRevisados, idOpened, setIdOpened, setOfferName, estado, onToggleEstado }) => {

    const navigate = useNavigate()

    const handleShowCVOffer = () => {
      setOfferName()
      if (idOpened === id) {
        setIdOpened(null)
      } else {
        setIdOpened(id)
      }
    }

    const handleGoToOfferDetails = (e) => {
      e.preventDefault()
      navigate(`/ofertas/${id}`)
    }

    const handleCloseOffer = (e) => {
      e.preventDefault()
      e.stopPropagation()
      onToggleEstado()
    }

    return (
        <div className="offer-card-wrap" onClick={() => {handleShowCVOffer()}}>
            <div className={`offer-card-offerer ${id == idOpened ? "offer-card-offerer-selected" : ""} ${estado === "Cerrado" ? "offer-card-offerer--closed" : ""}`}>
              <div className="offer-card-offerer__header">
                <div className="offer-card-offerer__header-top">
                  <span className="offer-card-offerer__company accent">{company}</span>
                  {estado === "Cerrado" && (
                    <span className="offer-card-offerer__estado-badge">CERRADA</span>
                  )}
                </div>
                <h3 className="offer-card-offerer__title">{title}</h3>
                <h4 className="offer-card-offerer__work-type">{workType}</h4>
                <span className="offer-card-offerer__location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="2 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="offer-card-offerer__location-text">
                    {location}
                  </span>
                </span>
              </div>
              <div className="offer-card-offerer__footer" >
                <span className="offer-card-offerer__salary accent">
                  ${salaryMin} - ${salaryMax}
                </span>
                <span className="offer-card-offerer__salary accent">
                  Cvs Recibidos: {postulantes.length + cvsRevisados.length}
                </span>
              </div>
            </div>
            <div className="offer-card-offerer__side-panel">
              <button className="offer-card-offerer__panel-button top" title="Ver en detalle" onClick={(e) => handleGoToOfferDetails(e)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                  viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" 
                  strokeLinecap="round" strokeLinejoin="round" 
                  className="lucide lucide-newspaper-icon lucide-newspaper">
                  <path d="M15 18h-5"/><path d="M18 14h-8"/>
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/>
                  <rect width="8" height="4" x="10" y="6" rx="1"/>
                </svg>
              </button>
              <button className="offer-card-offerer__panel-button bottom" title={estado === "Abierto" ? "Cerrar" : "Reabrir"} onClick={(e) => handleCloseOffer(e)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                  viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" 
                  strokeLinecap="round" strokeLinejoin="round" 
                  className="lucide lucide-trash2-icon lucide-trash-2">
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
        </div>
    )
}

export default OfferCardOfertante
