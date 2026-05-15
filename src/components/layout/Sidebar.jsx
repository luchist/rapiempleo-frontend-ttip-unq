import { useContext, useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import UserContext from '../UserProvider';

const Sidebar = () => {
  const [notify, setNotify] = useState()
  const [notifs, setNotifs] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState(null)

  const { user, isLogged } = useContext(UserContext);

  const token = localStorage.getItem("token")


  useEffect(() => {
    if (!user) return;
    if (!user.typeUser) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = () => {
    fetch(`http://localhost:8080/ofertante/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ofertante no encontrado')
        return res.json()
      })
      .then(data => {
        setNotify(data.nuevaNotifcacion)
        setNotifs(data.avisosPostulacion)
      })
      .catch(err => {
        setError(err.message)
      })
  }


  const NAV_ITEMS = [
    {
      path: '/',
      label: 'Inicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      path: '/estadisticas',
      label: 'Estadísticas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
  ]


  if (!isLogged) {
    NAV_ITEMS
  } else if (user.typeUser) {

    NAV_ITEMS.push({
      path: `/postulante/${user.id}/board`,
      label: 'Tablero',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      )
    })

    NAV_ITEMS.push({
      path: `/postulante/${user.id}`,
      label: 'Perfil',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    })
  } else {
    NAV_ITEMS.push({
      path: `/ofertante/${user.id}`,
      label: 'Perfil',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    })
  }

  const handleNotifyModal = () => {
    setModalOpen(!modalOpen)
  }

  const handleNotifyModalOff = () => {
    setModalOpen(false)
  }

  const handleDeleteNotify = (indexRemove) => {
    const notifsMod = notifs.filter((_, i) => i !== indexRemove)
    setNotifs(notifsMod)
    console.log(`Que se envia por index: ${indexRemove}`)
    if (notifsMod.length == 0) {
      setNotify(false)
    }
    fetch(`http://localhost:8080/ofertante/deleteNotify/${user.id}/${indexRemove}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo borrar la notificación')
        return res.json()
      })
      .catch(err => {
        setError(err.message)
      })
  }


  const location = useLocation()

  return (
    <aside className="sidebar">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => handleNotifyModalOff()}
          className={`sidebar-icon ${location.pathname === item.path ? 'sidebar-icon--active' : ''}`}
        >
          {item.icon}
          <span className="tooltip">{item.label}</span>
        </Link>
      ))}
      <span className='sidebar-icon' onClick={() => handleNotifyModal()}>
        {<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-bell-ring-icon lucide-bell-ring">
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M22 8c0-2.3-.8-4.3-2-6" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          <path d="M4 2C2.8 3.7 2 5.7 2 8" />
        </svg>}
        {(notifs.length != 0) ?
          <span className="counter-notify">
            {notifs.length}
          </span> : <></>}
        <span className="tooltip">Notificaciones</span>
      </span>
      {user && notify && modalOpen && !user.typeUser ?
        <div className="panel-notification">
          <h2 className='title-panel'>Notificaciones</h2>
          <div className="section-all-notifications">
            {notifs.map((notificacion, index) => (
              <div key={index} className="offer-notification">
                <div className='first-line-notification'>
                  <span>Hay un nuevo CV en oferta:</span>
                  <button className="button-delete-notify" onClick={() => handleDeleteNotify(index)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      class="lucide lucide-square-x-icon lucide-square-x">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="m15 9-6 6" /><path d="m9 9 6 6" />
                    </svg>
                  </button>
                </div>
                <span style={{ fontWeight: "bolder" }}>{notificacion}</span>
              </div>
            ))}
          </div>
        </div>
        : user && modalOpen && !user.typeUser ?
          <div className="panel-notification">
            <h2 className='title-panel'>Notificaciones</h2>
            <div className="section-no-notifications">
              <span className="das">A la espera de nuevas postulaciones</span>
            </div>
          </div>
          :
          <></>
      }
    </aside>
  )
}

export default Sidebar