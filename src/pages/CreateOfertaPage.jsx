import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BASE_URL = 'http://localhost:8080'

const CreateOfertaPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const [form, setForm] = useState({
        titulo: '',
        empresa: '',
        modalidad: '',
        ubicacion: '',
        sueldoMin: '',
        sueldoMax: '',
        descripcion: '',
    })
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [prefilling, setPrefilling] = useState(true)
    const [touched, setTouched] = useState({})

    useEffect(() => {
        fetch(`${BASE_URL}/ofertante/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error()
                return res.json()
            })
            .then(data => setForm(prev => ({ ...prev, empresa: data.empresa })))
            .catch(() => {})
            .finally(() => setPrefilling(false))
    }, [id, token])

    const validateField = (name, value, currentForm) => {
        switch (name) {
            case 'titulo': return !value.trim() ? 'El título es requerido.' : null
            case 'empresa': return !value.trim() ? 'La empresa es requerida.' : null
            case 'modalidad': return !value ? 'La modalidad es requerida.' : null
            case 'ubicacion': return !value.trim() ? 'La ubicación es requerida.' : null

            case 'sueldoMin': {
                if (!value) return 'El sueldo mínimo es requerido.'
                if (parseInt(value) < 0) return 'Debe ser un valor positivo.'
                if (currentForm.sueldoMax && parseInt(value) > parseInt(currentForm.sueldoMax))
                    return 'El sueldo mínimo no puede superar el máximo.'
                return null
            }
            case 'sueldoMax': {
                if (!value) return 'El sueldo máximo es requerido.'
                if (parseInt(value) < 0) return 'Debe ser un valor positivo.'
                if (currentForm.sueldoMin && parseInt(value) < parseInt(currentForm.sueldoMin))
                    return 'El sueldo máximo debe ser mayor o igual al mínimo.'
                return null
            }
            
            case 'descripcion': return !value.trim() ? 'La descripción es requerida.' : null
            default: return null
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const updatedForm = { ...form, [name]: value }
        setForm(updatedForm)
        if (touched[name]) {
            const error = validateField(name, value, updatedForm)
            const sibling = name === 'sueldoMin' ? 'sueldoMax' : name === 'sueldoMax' ? 'sueldoMin' : null
            setErrors(prev => ({
                ...prev,
                [name]: error,
                ...(sibling && touched[sibling]
                    ? { [sibling]: validateField(sibling, updatedForm[sibling], updatedForm) }
                    : {})
            }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        const error = validateField(name, value, form)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const validate = () => {
        const e = {}
        if (!form.titulo.trim()) e.titulo = 'El título es requerido.'
        if (!form.empresa.trim()) e.empresa = 'La empresa es requerida.'
        if (!form.modalidad) e.modalidad = 'La modalidad es requerida.'
        if (!form.ubicacion.trim()) e.ubicacion = 'La ubicación es requerida.'

        if (!form.sueldoMin) e.sueldoMin = 'El sueldo mínimo es requerido.'
        else if (parseInt(form.sueldoMin) < 0) e.sueldoMin = 'Debe ser un valor positivo.'
        if (!form.sueldoMax) e.sueldoMax = 'El sueldo máximo es requerido.'
        else if (parseInt(form.sueldoMax) < 0) e.sueldoMax = 'Debe ser un valor positivo.'
        if (form.sueldoMin && form.sueldoMax && parseInt(form.sueldoMin) > parseInt(form.sueldoMax))
            e.sueldoMax = 'El sueldo máximo debe ser mayor o igual al mínimo.'

        if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida.'

        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setTouched(Object.fromEntries(Object.keys(form).map(k => [k, true])))
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setLoading(true)
        setSubmitError(null)
        fetch(`${BASE_URL}/ofertante/${id}/oferta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo: form.titulo.trim(),
                empresa: form.empresa.trim(),
                descripcion: form.descripcion,
                modalidad: form.modalidad,
                sueldoMin: parseInt(form.sueldoMin),
                sueldoMax: parseInt(form.sueldoMax),
                ubicacion: form.ubicacion.trim(),
            })
        })
            .then(res => {
                if (!res.ok) throw new Error('No se pudo crear la oferta. Intente de nuevo.')
                return res.json()
            })
            .then(() => navigate(`/ofertante/${id}`))
            .catch(err => setSubmitError(err.message))
            .finally(() => setLoading(false))
    }

    if (prefilling) return <p>Cargando...</p>

    return (
        <div className="create-oferta-page">
            <div className="create-oferta-card">
                <h1 className="create-oferta-card__title">Nueva oferta de trabajo</h1>
                <form className="create-oferta-form" onSubmit={handleSubmit} noValidate>

                    <div className="create-oferta-form__group">
                        <label className="create-oferta-form__label">Título del puesto</label>
                        <input
                            className="create-oferta-form__input"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ej: Desarrollador Full Stack Sr."
                        />
                        {errors.titulo && <span className="create-oferta-form__field-error">{errors.titulo}</span>}
                    </div>

                    <div className="create-oferta-form__group">
                        <label className="create-oferta-form__label">Empresa</label>
                        <input
                            className="create-oferta-form__input"
                            name="empresa"
                            value={form.empresa}
                            disabled
                        />
                        {errors.empresa && <span className="create-oferta-form__field-error">{errors.empresa}</span>}
                    </div>

                    <div className="create-oferta-form__row">
                        <div className="create-oferta-form__group">
                            <label className="create-oferta-form__label">Modalidad</label>
                            <select
                                className="create-oferta-form__select"
                                name="modalidad"
                                value={form.modalidad}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Remoto">Remoto</option>
                                <option value="Hibrido">Híbrido</option>
                            </select>
                            {errors.modalidad && <span className="create-oferta-form__field-error">{errors.modalidad}</span>}
                        </div>

                        <div className="create-oferta-form__group">
                            <label className="create-oferta-form__label">Ubicación</label>
                            <input
                                className="create-oferta-form__input"
                                name="ubicacion"
                                value={form.ubicacion}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Ciudad, Provincia"
                            />
                            {errors.ubicacion && <span className="create-oferta-form__field-error">{errors.ubicacion}</span>}
                        </div>
                    </div>

                    <div className="create-oferta-form__row">
                        <div className="create-oferta-form__group">
                            <label className="create-oferta-form__label">Sueldo mínimo ($)</label>
                            <input
                                className="create-oferta-form__input"
                                type="number"
                                name="sueldoMin"
                                value={form.sueldoMin}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="0"
                                min="0"
                            />
                            {errors.sueldoMin && <span className="create-oferta-form__field-error">{errors.sueldoMin}</span>}
                        </div>

                        <div className="create-oferta-form__group">
                            <label className="create-oferta-form__label">Sueldo máximo ($)</label>
                            <input
                                className="create-oferta-form__input"
                                type="number"
                                name="sueldoMax"
                                value={form.sueldoMax}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="0"
                                min="0"
                            />
                            {errors.sueldoMax && <span className="create-oferta-form__field-error">{errors.sueldoMax}</span>}
                        </div>
                    </div>

                    <div className="create-oferta-form__group">
                        <label className="create-oferta-form__label">Descripción</label>
                        <textarea
                            className="create-oferta-form__textarea"
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Describe el puesto, requisitos, beneficios..."
                            rows={8}
                        />
                        {errors.descripcion && <span className="create-oferta-form__field-error">{errors.descripcion}</span>}
                    </div>

                    {submitError && <p className="create-oferta-form__submit-error">{submitError}</p>}

                    <div className="create-oferta-form__actions">
                        <button
                            type="button"
                            className="create-oferta-form__cancel"
                            onClick={() => navigate(`/ofertante/${id}`)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="create-oferta-form__submit"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar oferta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateOfertaPage
