import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import RegisterFormOfertante from "../components/register/RegisterFormOfertante"
import logo from '../assets/logo-cut-unicolor.jpg'

const OfertanteRegisterPage = () => {
    const [readyToLogin, setReadyToLogin] = useState(false)


    return (
        <div>
            <div className="slogan-app">
                <img src={logo} className='image-logo-login'/>
                <div className="slogan-text">
                    <h1 className="slogan-title">Bienvenido a una nueva opción para ofrecer puestos de trabajo</h1>
                </div>
            </div>
            <div className="register-section-wrapper">
                <div className="register-section full-expand">
                    <RegisterFormOfertante setReturnToLogin={() => setReadyToLogin(true)}/>
                </div>
                {readyToLogin ?
                    <Link to="/login" className="link-after-register">
                        ¡Haga click aquí para ir a la página de login! / O espere a ser redirigido en 5 segundos
                    </Link>
                :
                <></>}
            </div>
        </div>
    )

    
}

export default OfertanteRegisterPage