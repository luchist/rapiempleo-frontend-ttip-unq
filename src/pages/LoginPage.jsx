import { useContext, useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from "react-router-dom";
import { UserProvider } from '../components/UserProvider';
import "./LoginPage.css";
import UserContext from '../components/UserProvider';

const LoginPage = () => {
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState({});
    const [errorLogin, setErrorLogin] = useState();
    const { setAuth, isLogged, changeLogin } = useContext(UserContext);
    const [form, setForm] = useState({
        email: "",
        password: "",
        typeUser: ""
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
        if (!form.typeUser) {
            errors.typeUser = "Debe indicar su tipo de usuario";
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
            console.log(response)
            if (!response.ok) {
                console.log(`DATA PA VER: ${data}`)
                setErrorLogin(`Error: ${data.message}`);
                throw new Error("Login failed"); 
            }
            return data;
        })
        .then((data) => {
            console.log("Success:", data);
            changeLogin();
            console.log("TOKEN BEING SENT:", data.token);
            localStorage.setItem("token", data.token)
            setAuth(data);
            navigate("/home");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }


    return (
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
                    <div className='type-input-login'>
                        <input
                          type="radio"
                          name="typeUser"
                          value="Ofertante"
                          onChange={handleChange}
                        />
                        <label className="type-radio">Ofertante</label>
                        <input
                          type="radio"
                          name="typeUser"
                          value="Postulante"
                          onChange={handleChange}
                        />
                        <label className="type-radio">Postulante</label>
                    </div>
                    {errors.typeUser && <span className="error-login">{errors.typeUser}</span>}
                    <button type="submit" className='login-button'>Ingresar</button>
                    {errorLogin && <span className="error-credentials">{errorLogin}</span> }
                </form>
                
            </div>

        </div>
    )

}

export default LoginPage