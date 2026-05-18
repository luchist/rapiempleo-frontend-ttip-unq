

const NotificationModal = ({ notifications, tituloNotif, mensajeSinNotif, handleDeleteNotify }) => {

    return (
        <>
        {notifications && notifications.length > 0 ?
        <div className="panel-notification">
            <h2 className='title-panel'>Notificaciones</h2>
            <div className="section-all-notifications">
                {notifications.map((notificacion, index) => (
                    <div key={index} className="offer-notification">
                        <div className='first-line-notification'>
                            <span>{tituloNotif}</span>
                            <button className="button-delete-notify" onClick={() => handleDeleteNotify(index)} aria-label="Eliminar notificación" title="Eliminar notificación">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    className="lucide lucide-square-x-icon lucide-square-x">
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
        :
        <div className="panel-notification">
          <h2 className='title-panel'>Notificaciones</h2>
          <div className="section-no-notifications">
              <span className="das">{mensajeSinNotif}</span>
          </div>
        </div>
        }
        </>
    )
}

export default NotificationModal