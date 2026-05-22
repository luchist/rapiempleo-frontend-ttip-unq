import { useState } from "react";
import "../../pages/LoginPage.css";

const RegisterFormPostulante = () => {
    const [errors, setErrors] = useState({});
    const [errorRegister, setErrorRegister] = useState();
    const [responseOk, setResponseOk] = useState();

    const [form, setForm] = useState({
            name: "",
            email: "",
            password: "",
    });

    const emailSections = form.email.split('@');

    const handleRegisterSubmit = (registerData) => {
        registerData.preventDefault();
        const errors = {};
        if (!form.name) {
            errors.name = "El nombre es obligatorio";
        }
        if (!form.email) {
            errors.email = "El email es obligatorio";
        } else if (!form.email.includes('@') || emailSections.some(it => it.length == 0) || emailSections.length != 2) {
            errors.email = "El email ingresado no es válido"
        }
        if (!form.password) {
            errors.password = "La contraseña es obligatoria";
        } else if (form.password.length < 8) {
            errors.password = "Debe contener al menos 8 carácteres"
        } else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
            errors.password = "Debe contener al menos una mayúscula, una minúscula y un número"
        }
        setErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        fetch(`http://localhost:8080/postulante/registrar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
        .then(async (response) => {
            let data = null;
            console.log(response)

            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
            if (!response.ok) {
                console.log(`Data log: ${data}`)
                setErrorRegister(`Error: ${data.message}`);
                throw new Error("Register failed"); 
            }
            console.log(data)
            return data;
        })
        .then((data) => {
            setErrorRegister(null)
            setForm({
            name: "",
            email: "",
            password: ""})
            setResponseOk(`${data.message}`)
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }


    const handleChange = (registerData) => {
        setForm({
          ...form,
          [registerData.target.name]: registerData.target.value,
        });
    };

    return (
        <div>
            <form onSubmit={handleRegisterSubmit} className="form-section">
                <h3>Ingrese los siguientes datos para el registro</h3>
                <input className= "input-login"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nombre y Apellido"
                />
                {errors.name && <span className="error-login">{errors.name}</span>}
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
                <button type="submit" className='login-button'>Registrar</button>
                {errorRegister && <span className="error-credentials">{errorRegister}</span> }
                {responseOk && <span className="ok-credentials">{responseOk}</span> }
            </form>   
        </div>
    )
}

export default RegisterFormPostulante