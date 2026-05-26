import { useState } from "react"
import { Link } from "react-router-dom";
import "./OfferCardOfertante.css";


const OfferCardOfertante = ({ id, title, company, workType, location, salaryMin, salaryMax, postulantes, idOpened, setIdOpened, setCVs, setOfferName }) => {

    const [hovered, setHovered] = useState()

    const handleShowCVOffer = () => {
      setCVs(postulantes)
      setOfferName()
      if (idOpened === id) {
        setIdOpened(null)
      } else {
        setIdOpened(id)
      }
    }

    return (
        <div className="offer-card-wrap" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {hovered && (
                <div className="offer-card-hover-panel">
                    <Link to={`/ofertas/${id}`} className="offer-button-hover button-top button-link">
                        Ver detalle
                    </Link>
                    <button className="offer-button-hover">Eliminar</button>
                    <button className="offer-button-hover button-bottom" onClick={() => {handleShowCVOffer()}}> 
                        Mostrar CVs
                    </button>
                </div>
            )}
            <div className={`offer-card-offerer ${id == idOpened ? "offer-card-offerer-selected" : ""}`}>
              <div className="offer-card-offerer__header">
                <span className="offer-card-offerer__company accent">{company}</span>
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
                  Cvs Recibidos: {postulantes.length}
                </span>
              </div>
            </div>
        </div>
    )
}

export default OfferCardOfertante