const CV_SLOTS = 4

const PostulantProfilePage = () => {
  // mock
  const postulant = {
    name: 'Nombre Persona',
    preferencia: '',
  }

  return (
    <div className="postulant-profile">

      <div className="postulant-profile__header">
        <div className="postulant-profile__avatar" aria-label="Avatar" />
        <div className="postulant-profile__name-block">
          <h1 className="postulant-profile__name">{postulant.name}</h1>
          <div className="postulant-profile__name-underline" />
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
              <div key={i} className="postulant-profile__cv-slot" aria-label={`Slot CV ${i + 1}`}>
                <span className="postulant-profile__cv-slot-icon">＋</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default PostulantProfilePage
