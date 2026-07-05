import { useContext, useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import UserContext from '../UserProvider';
import ThemeContext from '../ThemeProvider';
import NotificationModalOfertante from '../NotificationModalOfertante';
import NotificationModalPostulante from '../NotificationModalPostulante';

const Sidebar = () => {
  const [notifs, setNotifs] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [_error, setError] = useState(null)

  const { user, isLogged, changeLogin, setUser } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const token = localStorage.getItem("token")
  const navigate = useNavigate();

  const fetchNotificationsOfferer = () => {
    fetch(`http://localhost:8080/ofertante/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (res.status == 401 || res.status == 403) {
          handleLogOut()
          return
        }
        if (!res.ok) throw new Error('Ofertante no encontrado')
        return res.json()
      })
      .then(data => {
        setNotifs(data.avisosPostulacion)
      })
      .catch(err => {
        setError(err.message)
      })
  }

  const fetchNotificationsPostulant = () => {
    fetch(`http://localhost:8080/postulante/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (res.status == 401 || res.status == 403) {
          handleLogOut()
          return
        }
        if (!res.ok) throw new Error('Postulante no encontrado')
        return res.json()
      })
      .then(data => {
        setNotifs(data.notificacionesCv)
      })
      .catch(err => {
        setError(err.message)
      })
  }

  useEffect(() => {
    if (!user) return;
    if (user.typeUser) {
      fetchNotificationsPostulant();
    } else {
      fetchNotificationsOfferer()
    }
    setModalOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const handleLogOut = () => {
    // Solo limpiamos las claves de sesión, conservamos la preferencia de tema
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    changeLogin()
    navigate("/")
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
  ]


  if (!isLogged) {
    NAV_ITEMS
  } else if (user.typeUser) {

    NAV_ITEMS.push({
      path: '/estadisticas',
      label: 'Estadísticas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    })

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
    let typeUs
    if (user.typeUser) { typeUs = "postulante" } else { typeUs = "ofertante" }

    fetch(`http://localhost:8080/${typeUs}/deleteNotify/${user.id}/${indexRemove}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) { throw new Error('No se pudo borrar la notificación') }

        const notifsMod = notifs.filter((_, i) => i !== indexRemove)
        setNotifs(notifsMod)
        return res.json()
      })
      .catch(err => {
        setError(err.message)
      })
  }


  const location = useLocation()

  return (
    <aside className="sidebar">
      {isLogged &&
        NAV_ITEMS.map((item) => (
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
      {isLogged &&
        <span className='sidebar-icon' onClick={() => handleNotifyModal()}>
          {<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell-ring-icon lucide-bell-ring">
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M22 8c0-2.3-.8-4.3-2-6" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
            <path d="M4 2C2.8 3.7 2 5.7 2 8" />
          </svg>}
          {isLogged && (notifs.length != 0) ?
            <span className="counter-notify">
              {notifs.length}
            </span> : <></>}
          <span className="tooltip">Notificaciones</span>
        </span>
      }
      {isLogged && modalOpen && !user.typeUser ?
        <NotificationModalOfertante className="notification-panel-offerer"
          notifications={notifs}
          tituloNotif={"Hay un nuevo CV en oferta: "}
          mensajeSinNotif={"A la espera de nuevas postulaciones"}
          handleDeleteNotify={handleDeleteNotify} />
        :
        isLogged && modalOpen && user.typeUser ?
          <NotificationModalPostulante className="notification-panel-postulant"
            notifications={notifs}
            mensajeSinNotif={"A la espera que tus postulaciones sean revisadas"}
            handleDeleteNotify={handleDeleteNotify} />
          :
          <></>
      }
      {isLogged &&
        <span className='sidebar-icon theme-toggle-icon' onClick={() => toggleTheme()}>
          {theme === "dark" ?
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun-icon lucide-sun">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
            :
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon-icon lucide-moon">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          }
          <span className="tooltip">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
        </span>
      }
      {isLogged ?
        <span className='sidebar-icon log-out-icon' onClick={() => handleLogOut()}>
          {<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon lucide-log-out">
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          </svg>}
          <span className="tooltip">Cerrar sesión</span>
        </span>
        :
        <></>
      }
    </aside>
  )
}

export default Sidebar
