import { useEffect, useState, useRef, useContext } from "react"
import { useParams } from "react-router-dom"
import CvModal from "../components/CvModal"
import UserContext from "../components/UserProvider"

const CV_SLOTS = 4
const FAVORITE_SLOTS = 3
const BASE_URL = "http://localhost:8080"

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const PostulantProfilePage = () => {
  const { id } = useParams()
  const { user } = useContext(UserContext)
  const [postulant, setPostulant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cvSlots, setCvSlots] = useState(Array(CV_SLOTS).fill(null))
  const [cvFavorito, setCvFavorito] = useState(null)
  const [cvModalBlobUrl, setCvModalBlobUrl] = useState(null)
  const [cvModalFilename, setCvModalFilename] = useState(null)
  const [cvModalCvPath, setCvModalCvPath] = useState(null)
  const [profilePicUrl, setProfilePicUrl] = useState(null)
  const [profilePicError, setProfilePicError] = useState(null)
  const fileInputRef = useRef(null)
  const currentSlotIndex = useRef(null)
  const profilePicInputRef = useRef(null)
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
        if (data.fotoPerfil) {
          const filename = data.fotoPerfil.split('/').pop()
          fetch(`${BASE_URL}/files/fotos/postulante/${id}/${filename}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.blob())
            .then(blob => setProfilePicUrl(URL.createObjectURL(blob)))
            .catch(() => {})
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, token])

  const handleCvSlotClick = (index) => {
    const path = cvSlots[index]
    if (path) {
      const filename = path.split('/').pop()
      const url = `${BASE_URL}/files/cvs/${id}/${filename}`
      setCvModalFilename(filename)
      setCvModalCvPath(path)
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

  const handleSetFavoritoFromModal = () => {
    if (!cvModalCvPath) return
    fetch(`${BASE_URL}/postulante/${id}/cv/favorito?cvPath=${encodeURIComponent(cvModalCvPath)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo actualizar el CV favorito')
        setCvFavorito(cvModalCvPath)
      })
      .catch(err => console.error(err))
  }

  const handleCloseModal = () => {
    if (cvModalBlobUrl) URL.revokeObjectURL(cvModalBlobUrl)
    setCvModalBlobUrl(null)
    setCvModalFilename(null)
    setCvModalCvPath(null)
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
      setProfilePicError('Solo se permiten archivos JPG o PNG de hasta 5 MB.')
      e.target.value = null
      return
    }
    setProfilePicError(null)
    const formData = new FormData()
    formData.append('file', file)
    fetch(`${BASE_URL}/postulante/${id}/foto`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => { if (!res.ok) throw new Error() ; return res.json() })
      .then(data => {
        const filename = data.imgPath.split('/').pop()
        return fetch(`${BASE_URL}/files/fotos/postulante/${id}/${filename}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.blob()).then(blob => URL.createObjectURL(blob))
      })
      .then(blobUrl => setProfilePicUrl(blobUrl))
      .catch(() => setProfilePicError('Error al subir la imagen. Intente de nuevo.'))
      .finally(() => { e.target.value = null })
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
        if (cvSlots.includes(data.cvPath)) return
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

      {cvModalBlobUrl && (
        <CvModal
          blobUrl={cvModalBlobUrl}
          filename={cvModalFilename}
          isFavorito={cvModalCvPath != null && cvFavorito === cvModalCvPath}
          onSetFavorito={handleSetFavoritoFromModal}
          onClose={handleCloseModal}
        />
      )}

      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        ref={profilePicInputRef}
        style={{ display: 'none' }}
        onChange={handleProfilePicChange}
      />

      <div className="postulant-profile__header">
        <div className="postulant-profile__avatar">
          {profilePicUrl && <img src={profilePicUrl} className="profile-pic__img" alt="Foto de perfil" />}
          {(
            <button
              className="profile-pic__overlay"
              onClick={() => profilePicInputRef.current.click()}
              aria-label="Subir imagen de perfil"
              title="Subir imagen de perfil"
            >
              <span className="profile-pic__label">Subir imagen</span>
            </button>
          )}
        </div>
        {profilePicError && <p className="profile-pic__error">{profilePicError}</p>}
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
                title={cvPath != null ? 'Abrir curriculum' : 'Subir curriculum en formato PDF'}
              >
                {cvPath ? (
                  <>
                    <span className="postulant-profile__cv-slot-name">{cvPath.split('/').pop()}</span>
                    <button
                      className={`postulant-profile__cv-slot-star${cvPath === cvFavorito ? ' postulant-profile__cv-slot-star--active' : ''}`}
                      onClick={(e) => handleSetFavorito(e, cvPath)}
                      title={cvPath === cvFavorito ? 'Favorito actual' : 'Establecer como favorito'}
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
