import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import CvModal from "../components/CvModal"

const CV_SLOTS = 4
const FAVORITE_SLOTS = 3
const BASE_URL = "http://localhost:8080"

const PostulantProfilePage = () => {
  const { id } = useParams()
  const [postulant, setPostulant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cvSlots, setCvSlots] = useState(Array(CV_SLOTS).fill(null))
  const [cvFavorito, setCvFavorito] = useState(null)
  const [cvModalPath, setCvModalPath] = useState(null)
  const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)
  const fileInputRef = useRef(null)
  const currentSlotIndex = useRef(null)
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetch(`${BASE_URL}/postulante/${id}`, {
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
        setCvFavorito(data.cvFavorito)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleCvSlotClick = (index) => {
    const path = cvSlots[index]
    if (path) {
      const filename = path.split('/').pop()
      const url = `${BASE_URL}/files/cvs/${id}/${filename}`
      setCvModalPath(url)
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) throw new Error('No se pudo cargar el CV')
          return res.blob()
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob)
          setCvModalBlobUrl(blobUrl)
        })
        .catch(err => console.error(err))
    } else {
      currentSlotIndex.current = cvSlots.indexOf(null)
      fileInputRef.current.click()
    }
  }

  const handleSetFavorito = (e, cvPath) => {
    e.stopPropagation()
    fetch(`${BASE_URL}/postulante/${id}/cv/favorito?cvPath=${encodeURIComponent(cvPath)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo actualizar el CV favorito')
        setCvFavorito(cvPath)
      })
      .catch(err => console.error(err))
  }

  const handleCloseModal = () => {
    if (cvModalBlobUrl) URL.revokeObjectURL(cvModalBlobUrl)
    setCvModalPath(null)
    setCvModalBlobUrl(null)
  }

  const handleFileChange = (event) => {
    const archivo = event.target.files[0]
    if (!archivo) return

    const formData = new FormData()
    formData.append("file", archivo)

    fetch(`${BASE_URL}/postulante/${id}/cv`, {
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
        if (!cvFavorito) {
          setCvFavorito(data.cvPath)
        }
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

      {cvModalPath && (
        <CvModal
          blobUrl={cvModalBlobUrl}
          onClose={handleCloseModal}
        />
      )}

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
                onClick={() => handleCvSlotClick(i)}
              >
                {cvPath ? (
                  <>
                    <span className="postulant-profile__cv-slot-name">{cvPath.split('/').pop()}</span>
                    <button
                      className={`postulant-profile__cv-slot-star${cvPath === cvFavorito ? ' postulant-profile__cv-slot-star--active' : ''}`}
                      onClick={(e) => handleSetFavorito(e, cvPath)}
                      title={cvPath === cvFavorito ? 'CV favorito actual' : 'Establecer como favorito'}
                    >
                      ★
                    </button>
                  </>
                ) : (
                  <span className="postulant-profile__cv-slot-icon">＋</span>
                )}
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
