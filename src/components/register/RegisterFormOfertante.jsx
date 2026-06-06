import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterFormOfertante = ({setReturnToLogin}) => {
    const [errors, setErrors] = useState({});
    const [errorRegister, setErrorRegister] = useState();
    const [errorVerification, setErrorVerification] = useState();
    const [responseOk, setResponseOk] = useState();
    const [businessVerified, setBusinessVerified] = useState(false);

    const [businessForm, setBusinessForm] = useState({
        company: "",
        cuit: "",
        ubication: "",
    });
    const [form, setForm] = useState({
            name: "",
            email: "",
            password: "",
            company: "",
    });

    const navigate = useNavigate()

    const handleCompanyVerification = (companyData) => {
        companyData.preventDefault()
        const errors = {};
        if (!businessForm.company) {
            errors.company = "El nombre de la empresa es obligatorio";
        }
        if (!businessForm.cuit) {
            errors.cuit = "El cuit de la empresa es obligatorio";
        }
        if (!businessForm.ubication) {
            errors.ubication = "Es obligatorio indicar la ubicación asociada";
        }

        setErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        fetch(`http://localhost:8080/verificarEmpresa`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(businessForm),
        })
        .then(async (response) => {
            let data = null;
            console.log(response)

            try {
                data = await response.json();
            } catch {
                data = null;
            }
            if (!response.ok) {
                setErrorVerification(`Error: ${data?.message ?? "No se pudo verificar la empresa"}`);
                throw new Error("Verification failed"); 
            }
            return data;
        })
        .then(() => {
            setErrorVerification(null)
            setBusinessVerified(true)
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    const handleRegisterSubmit = (registerData) => {
        registerData.preventDefault();
        const errors = {};
        if (!businessVerified) {
            errors.verification = "No se valido los datos de su negocio asociado"
        }
        if (!form.name) {
            errors.name = "El nombre es obligatorio";
        }
        if (!form.email) {
            errors.email = "El email es obligatorio";
        } else if (!form.email.includes('@') || form.email.startsWith('@') || form.email.endsWith('@')) {
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
        setForm({
          ...form,
          [businessForm.company.name]: businessForm.company.value,
        })

        fetch(`http://localhost:8080/ofertante/registrar`, {
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
            } catch {
                data = null;
            }
            if (!response.ok) {
                console.log(`Data log: ${data}`)
                setErrorRegister(`Error: ${data?.message ?? "No se pudo completar el registro"}`);
                throw new Error("Register failed"); 
            }
            return data;
        })
        .then((data) => {
            setErrorRegister(null)
            setResponseOk(`${data?.message ?? ""}`)
            setForm({
            name: "",
            email: "",
            password: "",
            company: ""})
            setReturnToLogin()
            setTimeout(() => {
                navigate('/');
            }, 6000)
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

    const handleEdit = (comapanyData) => {
        setBusinessForm({
          ...businessForm,
          [comapanyData.target.name]: comapanyData.target.value,
        });
        if (comapanyData.target.name == "company") {
            setForm({
            ...form,
            ["company"]: comapanyData.target.value,
        })
        }
    };



    return (
        <div>
            <form onSubmit={handleRegisterSubmit} className="form-section">
                <h3>Ingrese los siguientes datos para su registro</h3>
                <div className="">
                    <h4 className="subtitle-register">
                        Por favor rellene estos campos para verificar su negocio:
                    </h4>
                    <input className= "input-login"
                      name="company"
                      value={businessForm.company}
                      onChange={handleEdit}
                      placeholder="Nombre empresa/negocio"
                      disabled={businessVerified}
                    />
                    {errors.company && <span className="error-login">{errors.company}</span>}
                    <input className= "input-login"
                      name="cuit"
                      value={businessForm.cuit}
                      onChange={handleEdit}
                      placeholder="Cuit de empresa/negocio"
                      disabled={businessVerified}
                    />
                    {errors.cuit && <span className="error-login">{errors.cuit}</span>}
                    <input className= "input-login"
                      name="ubication"
                      value={businessForm.ubication}
                      onChange={handleEdit}
                      placeholder="Ubicacion de empresa/negocio"
                      disabled={businessVerified}
                    />
                    {errors.company && <span className="error-login">{errors.ubication}</span>}
                    <div className="last-line-verification">
                        <button className="login-button" type="button" disabled={businessVerified}
                                onClick={handleCompanyVerification} >
                                {businessVerified ? "Negocio verificado": "Verificar su negocio"} 
                        </button>
                        {businessVerified ?
                        <div className="verification-tick-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" 
                                viewBox="0 0 24 24" fill="none" 
                                stroke="#44c520" strokeWidth="2" 
                                strokeLinecap="round" strokeLinejoin="round" 
                                className="lucide lucide-check-line-icon lucide-check-line">
                                <path d="M20 4L9 15"/>
                                <path d="M21 19L3 19"/>
                                <path d="M9 15L4 10"/>
                            </svg>
                        </div>
                        : 
                        <></>
                        }
                    </div>
                    {errorVerification && <span className="error-credentials">{errorVerification}</span> }
                </div>
                <div className="">
                    <h4 className="subtitle-register">
                        Por último, rellene sus datos básicos para terminar:
                    </h4>
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
                </div>
                <button type="submit" className='login-button'>Registrar</button>
                {errors.verification && <span className="error-verification">{errors.verification}</span>}
                {errorRegister && <span className="error-credentials">{errorRegister}</span> }
                {responseOk && <span className="ok-credentials">{responseOk}</span> }
            </form>   
        </div>
    )
}

export default RegisterFormOfertante