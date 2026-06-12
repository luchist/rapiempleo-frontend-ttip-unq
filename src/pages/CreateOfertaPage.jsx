import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor ,  { commands } from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import UserContext from '../components/UserProvider'

const BASE_URL = 'http://localhost:8080'

const CreateOfertaPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
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
    const [prefillFailed, setPrefillFailed] = useState(false)
    const [touched, setTouched] = useState({})
    const markdownFileInputRef = useRef(null)

    useEffect(() => {
        if (user && String(user.id) !== id) navigate(`/ofertante/${id}`)
    }, [user, id, navigate])

    useEffect(() => {
        fetch(`${BASE_URL}/ofertante/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error()
                return res.json()
            })
            .then(data => setForm(prev => ({ ...prev, empresa: data.empresa })))
            .catch(() => setPrefillFailed(true))
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
                if (parseInt(value, 10) < 0) return 'Debe ser un valor positivo.'
                if (currentForm.sueldoMax && parseInt(value, 10) > parseInt(currentForm.sueldoMax, 10))
                    return 'El sueldo mínimo no puede superar el máximo.'
                return null
            }
            case 'sueldoMax': {
                if (!value) return 'El sueldo máximo es requerido.'
                if (parseInt(value, 10) < 0) return 'Debe ser un valor positivo.'
                if (currentForm.sueldoMin && parseInt(value, 10) < parseInt(currentForm.sueldoMin, 10))
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

    const handleDescriptionChange = (val) => {
        const value = val ?? ''
        const updatedForm = { ...form, descripcion: value }
        setForm(updatedForm)
        if (touched.descripcion) {
            setErrors(prev => ({
                ...prev,
                descripcion: validateField('descripcion', value, updatedForm)
            }))
        }
    }

    const handleMarkdownUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            handleDescriptionChange(ev.target.result)
            setTouched(prev => ({ ...prev, descripcion: true }))
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    const uploadMarkdownCommand = {
        name: 'uploadMd',
        keyCommand: 'uploadMd',
        buttonProps: { 'aria-label': 'Cargar archivo .md', title: 'Cargar archivo .md' },
        icon: (
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
            </svg>
        ),
        execute: () => markdownFileInputRef.current?.click(),
    }

    const handleDescriptionBlur = () => {
        setTouched(prev => ({ ...prev, descripcion: true }))
        setErrors(prev => ({
            ...prev,
            descripcion: validateField('descripcion', form.descripcion, form)
        }))
    }

    const validate = () => {
        const errors = {}
        Object.keys(form).forEach(field => {
            const error = validateField(field, form[field], form)
            if (error) errors[field] = error
        })
        return errors
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
                descripcion: form.descripcion.trim(),
                modalidad: form.modalidad,
                sueldoMin: parseInt(form.sueldoMin, 10),
                sueldoMax: parseInt(form.sueldoMax, 10),
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
            <input type="file" accept=".md" ref={markdownFileInputRef} style={{ display: 'none' }} onChange={handleMarkdownUpload} />
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
                            disabled={!prefillFailed}
                            onChange={prefillFailed ? handleChange : undefined}
                            onBlur={prefillFailed ? handleBlur : undefined}
                        />
                        {prefillFailed && <span className="create-oferta-form__field-hint">No se pudo cargar la empresa automáticamente.</span>}
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
                        <div
                            data-color-mode="dark"
                            className="create-oferta-form__md-wrapper"
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) handleDescriptionBlur()
                            }}
                        >
                            <MDEditor
                                value={form.descripcion}
                                onChange={handleDescriptionChange}
                                preview="edit"
                                height={320}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]],
                                }}
                                textareaProps={{
                                    placeholder: "Describe las responsabilidades, requisitos y beneficios del puesto...",
                                    maxLength: 5000
                                }}
                                commands={[
                                    commands.bold, commands.italic, commands.strikethrough, commands.divider,
                                    commands.group(
                                    [
                                        commands.title1,
                                        commands.title2,
                                        commands.title3,
                                        commands.title4,
                                        commands.title5,
                                        commands.title6
                                    ],
                                    {
                                        name: "title",
                                        groupName: "title",
                                        buttonProps: { "aria-label": "Insert title", "title": "Insert title" }
                                    }),
                                    commands.heading, commands.hr, commands.divider,
                                    commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand, commands.divider,
                                    commands.link, commands.quote, commands.code, commands.codeBlock
                                ]}
                                extraCommands={[
                                    commands.divider, uploadMarkdownCommand, commands.divider,
                                    commands.codeEdit, commands.codePreview
                                ]}
                            />
                        </div>
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
