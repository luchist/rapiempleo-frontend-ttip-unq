import { useContext, useState} from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import "./LoginPage.css";
import UserContext from '../components/UserProvider';
import logo from '../assets/logo-cut-unicolor.jpg'
import RegisterFormPostulante from '../components/register/RegisterFormPostulante';
import RegisterFormOfertante from '../components/register/RegisterFormOfertante';

const LoginPage = () => {
    const [errors, setErrors] = useState({});
    const [errorLogin, setErrorLogin] = useState();
    const { setAuth, isLogged, changeLogin } = useContext(UserContext);
    const [typeUser, setTypeUser] = useState("")
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (loginData) => {
        setForm({
          ...form,
          [loginData.target.name]: loginData.target.value,
        });
    };

    const handleSubmit = (loginData) => {
        loginData.preventDefault();
        const errors = {};
        if (!form.email) {
            errors.email = "El email es obligatorio";
        }
        if (!form.password) {
            errors.password = "La contraseña es obligatoria";
        }
        setErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
        .then(async (response) => {
            let data = null;

            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
            if (!response.ok) {
                console.log(`Data log: ${data}`)
                setErrorLogin(`Error: ${data.message}`);
                throw new Error("Login failed"); 
            }
            return data;
        })
        .then((data) => {
            changeLogin();
            localStorage.setItem("token", data.token)
            setAuth(data);
            navigate("/home");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }




    return (
        <div className="login-page-total">
            <div className="slogan-app">
                <img src={logo} className='image-logo-login'/>
                <div className="slogan-text">
                    <h1 className="slogan-title">Bienvenido a una forma rápida y sencilla de buscar empleo</h1>
                </div>
            </div>
            <div className="slogan-description">
                Para todo el que este buscando su primer empleo, un cambio de ambiente, 
                o solo busca ofrecer empleo de forma más directa
            </div>
            <div className='login-slogan-grid'>
                <div className='login-section-title'>
                    {isLogged && <Navigate to="/home" replace={true} />}
                    <h2 className='title-text-login'>Unete en la búsqueda <br/> de un trabajo acorde a vos</h2>
                    <div className='login-form-section'>
                        <form onSubmit={handleSubmit} className="form-section">
                            <h3>Ingrese sus datos para loguearse</h3>
                            <input className= "input-login"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="E-mail"
                            />
                            {errors.email && <span className="error-login">{errors.email}</span>}
                            <input className= "input-login"
                              type="password"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              placeholder="Contraseña"
                            />
                            {errors.password && <span className="error-login">{errors.password}</span>}
                            <button type="submit" className='login-button'>Ingresar</button>
                            {errorLogin && <span className="error-credentials">{errorLogin}</span> }
                        </form>   
                    </div>
                </div>
                <div className='title-register-section-'>
                    <h2>Registro de usuario</h2>
                    <div className={`register-section ${typeUser == "Postulante" ? "expand"  : typeUser == "Ofertante" ? "full-expand" : ""} `}>
                        <h3 className="type-radio-register-title">Seleccione su tipo de usuario</h3>
                        <div className='type-input-login'>
                            <input
                              type="radio"
                              name="typeUser"
                              value="Postulante"
                              onChange={() => setTypeUser("Postulante")}
                            />
                            <label className="type-radio">Postulante</label>
                            <input
                              type="radio"
                              name="typeUser"
                              value="Ofertante"
                              onChange={() => setTypeUser("Ofertante")}
                            />
                            <label className="type-radio">Ofertante</label>
                        </div>
                        {typeUser == "Postulante" ?
                            <RegisterFormPostulante />
                        :
                        typeUser == "Ofertante" ?
                            <RegisterFormOfertante />
                        :
                        <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default LoginPage