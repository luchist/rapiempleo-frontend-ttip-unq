import { useContext, useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from "react-router-dom";
import { UserProvider } from '../components/UserProvider';
import "./LoginPage.css";
import UserContext from '../components/UserProvider';

const LoginPage = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [errors, setErrors] = useState({});
    const { setAuth, isLogged, changeLogin } = useContext(UserContext);
    const [form, setForm] = useState({
        email: "",
        password: "",
        typeUser: ""
    });


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
            errors.email = "El email de usuario es obligatorio";
        }
        if (!form.password) {
            errors.password = "La contraseña es obligatoria";
        }
        fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
        .then((response) => {
            console.log("Success:", response);
            return response.json();
        })
        .then((data) => {
            changeLogin();
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
                <form onSubmit={handleSubmit}>
                    <h3>Ingrese sus datos para loguearse</h3>
                    <input className= "input-login"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="E-mail"
                    />
   
                    {errors.email && <span className="error">{errors.email}</span>}
                    <input className= "input-login"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Contraseña"
                    />
                    {errors.password && <span className="error">{errors.password}</span>}
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
                    <button type="submit" className='login-button'>Ingresar</button>
                </form>
                
            </div>

        </div>
    )

}

export default LoginPage