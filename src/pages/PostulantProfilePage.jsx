import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"

const CV_SLOTS = 4
const FAVORITE_SLOTS = 3

const PostulantProfilePage = () => {
  const { id } = useParams()
  const [postulant, setPostulant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch(`http://localhost:8080/postulante/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Postulante no encontrado')
        return res.json()
      })
      .then(data => {
        setPostulant(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleCvSlotClick = (index) => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (loading) return <p>Cargando perfil...</p>
  if (error) return <p>Error: {error}</p>
  return (
    <div className="postulant-profile">

      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      <div className="postulant-profile__header">
        <div className="postulant-profile__avatar" aria-label="Avatar" />
        <div className="postulant-profile__name-block">
          <h1 className="postulant-profile__name">{postulant.nombre}</h1>
          <div className="postulant-profile__underline" />
        </div>
      </div>

      <div className="postulant-profile__body">

        <div className="postulant-profile__preference-block">
          <div className="postulant-profile__preference-box">
            <p className="postulant-profile__preference-label">Preferencias</p>
            <p className="postulant-profile__preference-text">
              {postulant.preferencia || ''}
            </p>
          </div>
        </div>

        <div className="postulant-profile__cv-block">
          <div className="postulant-profile__cv-grid">
            {Array.from({ length: CV_SLOTS }).map((_, i) => (
              <div key={i} className="postulant-profile__cv-slot" aria-label={`Slot CV ${i + 1}`} onClick={() => handleCvSlotClick(i)}>
                <span className="postulant-profile__cv-slot-icon">＋</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="postulant-profile__underline" />

      <h3><span className="accent">▍</span>Favoritos</h3>

      <div className="postulant-profile__favorite-block">
        <div className="postulant-profile__favorite-grid">
          {Array.from({ length: FAVORITE_SLOTS }).map((_, i) => (
            <div key={i} className="postulant-profile__favorite-slot" aria-label={`Slot Fav ${i + 1}`}>
              <span className="postulant-profile__favorite-slot-icon">＊</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default PostulantProfilePage
