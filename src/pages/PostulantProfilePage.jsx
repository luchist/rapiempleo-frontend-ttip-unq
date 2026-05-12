import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"

const CV_SLOTS = 4
const FAVORITE_SLOTS = 3

const PostulantProfilePage = () => {
  const { id } = useParams()
  const [postulant, setPostulant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cvSlots, setCvSlots] = useState(Array(CV_SLOTS).fill(null))
  const fileInputRef = useRef(null)
  const currentSlotIndex = useRef(null)
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetch(`http://localhost:8080/postulante/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Postulante no encontrado')
        return res.json()
      })
      .then(data => {
        setPostulant(data)
        const slots = Array(CV_SLOTS).fill(null)
        data.cvPaths.forEach((path, i) => {
          if (i < CV_SLOTS) slots[i] = path
        })
        setCvSlots(slots)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleCvSlotClick = (index) => {
    currentSlotIndex.current = cvSlots.indexOf(null)
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const archivo = event.target.files[0]
    if (!archivo) return

    const formData = new FormData()
    formData.append("file", archivo)

    fetch(`http://localhost:8080/postulante/${id}/cv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al subir el CV")
        return res.json()
      })
      .then(data => {
        const newSlots = [...cvSlots]
        newSlots[currentSlotIndex.current] = data.cvPath
        setCvSlots(newSlots)
      })
      .catch(err => console.error(err))

    event.target.value = null
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
        onChange={handleFileChange}
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
          <h3 className="postulant-profile__section-title"><span className="accent">▍</span>Preferencias</h3>
          <div className="postulant-profile__preference-box">
            <p className="postulant-profile__preference-text">
              {postulant.preferencia || ''}
            </p>
          </div>
        </div>

        <div className="postulant-profile__cv-block">
          <h3 className="postulant-profile__section-title"><span className="accent">▍</span>Mis CV</h3>
          <div className="postulant-profile__cv-grid">
            {cvSlots.map((cvPath, i) => (
              <div
                key={i}
                className={`postulant-profile__cv-slot ${cvPath ? 'postulant-profile__cv-slot--loaded' : ''}`}
                aria-label={`Slot CV ${i + 1}`}
                onClick={() => !cvPath && handleCvSlotClick(i)}
              >
                {cvPath
                  ? <span className="postulant-profile__cv-slot-name">{cvPath.split('/').pop()}</span>
                  : <span className="postulant-profile__cv-slot-icon">＋</span>
                }
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="postulant-profile__underline" />

      <h3 className="postulant-profile__section-title"><span className="accent">▍</span>Favoritos</h3>

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
