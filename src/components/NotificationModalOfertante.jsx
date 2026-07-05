

const NotificationModalOfertante = ({ notifications, tituloNotif, mensajeSinNotif, handleDeleteNotify }) => {
    

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
                                        ✖
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

export default NotificationModalOfertante