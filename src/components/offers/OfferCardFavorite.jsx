import { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./OfferCardFavorite.css";

const OfferCardFavorite = ({ id, title, company, workType, salaryMin, salaryMax, handleRemove }) => {
  
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const [error, setError] = useState()

  const handleRemoveFavorite = () => {
    fetch(`http://localhost:8080/postulante/removeFavorito/${user.id}/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        }
    })
    .then(res => {
      if (!res.ok) throw new Error('Ofertante no encontrado')
      return res.text()
    })
    .then(
      handleRemove(id)
    )
    .catch(err => {
      setError(err.message)
    })
  }
  

  return (
    <>
    {error && <p>Error: {error}</p> }
    <div className="offer-card-favorite" onClick={() => navigate(`/ofertas/${id}`)}>
      <div className="offer-card-favorite__header">
        <span className="offer-card-favorite__company accent">{company}</span>
        <h3 className="offer-card-favorite__title">{title}</h3>
        <h4 className="offer-card-favorite__work-type">{workType}</h4>
      </div>
      <div className="offer-card-favorite__footer">
        <span className="offer-card-favorite__salary accent">
          ${salaryMin} - ${salaryMax}
        </span>
        <button className={`offer-card-favorite__favorite-icon `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveFavorite();
          }}>
          <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
    </div>
    </>
  )
}

export default OfferCardFavorite