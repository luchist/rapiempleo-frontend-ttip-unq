import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor ,  { commands } from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import UserContext from '../components/UserProvider'
import ThemeContext from '../components/ThemeProvider'
import ErrorAlert from '../components/alerts/ErrorAlert'
import ConfirmationAlert from '../components/alerts/ConfirmationAlert'

const BASE_URL = 'http://localhost:8080'

const CreateOfertaPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
    const { theme } = useContext(ThemeContext)
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
    const [errorUploadMD, setErrorUploadMD] = useState(null)
    const [showConfirmButton, setShowConfirmButton] = useState(false)

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
        if (!file.name.toLowerCase().endsWith('.md')) {
            setErrors(prev => ({ ...prev, descripcion: 'Solo se permiten archivos .md' }))
            setErrorUploadMD("Solo se permiten archivos .md")
            setTouched(prev => ({ ...prev, descripcion: true }))
            e.target.value = ''
            return
        }
        if (file.size > 20000) {
            setErrors(prev => ({ ...prev, descripcion: 'El archivo es demasiado grande (máx. ~5000 caracteres)' }))
            setErrorUploadMD("El archivo es demasiado grande (máx. ~5000 caracteres")
            setTouched(prev => ({ ...prev, descripcion: true }))
            e.target.value = ''
            return
        }
        const reader = new FileReader()
        reader.onload = (ev) => {
            handleDescriptionChange(ev.target.result.slice(0, 5000))
            setTouched(prev => ({ ...prev, descripcion: true }))
        }
        reader.onerror = () => {
            setErrors(prev => ({ ...prev, descripcion: 'Error al leer el archivo. Intente de nuevo.' }))
            setTouched(prev => ({ ...prev, descripcion: true }))
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    const withTooltip = (cmd, label) => ({ ...cmd, buttonProps: { 'aria-label': label, title: label } })

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
        setShowConfirmButton(true)
        setLoading(true)
        setSubmitError(null)
    }

    const handleConfirm = () => {
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
        .then(() => {
            setShowConfirmButton(false)
            navigate(`/ofertante/${id}`)
        })
        .catch(err => setSubmitError(err.message))
        .finally(() => setLoading(false))
    }

    const handleCancel = () => {
        setShowConfirmButton(false)
        setLoading(false)
    }

    if (prefilling) return <p>Cargando...</p>

    return (
        <>
        <div className="create-oferta-alerts-wrapper">
            {errorUploadMD ? <ErrorAlert textForError={errorUploadMD} page="create-offer"
                onAlertClose={() => setErrorUploadMD(null)}/> : <></>}
        </div>
        <div>
            {showConfirmButton ? 
                <ConfirmationAlert 
                    questionMessage="¿Esta seguro que desea crear la oferta?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    page="create-offer"
                /> 
                :
                <></>}
        </div>
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
                            data-color-mode={theme}
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
                                    withTooltip(commands.bold, 'Negrita (ctrl + b)'),
                                    withTooltip(commands.italic, 'Cursiva (ctrl + i)'),
                                    withTooltip(commands.strikethrough, 'Tachado (ctrl + shift + x)'),
                                    commands.divider,
                                    withTooltip(commands.heading, 'Insertar título'),
                                    commands.group(
                                    [
                                        withTooltip(commands.title1, 'Encabezado 1 (ctrl + 1)'),
                                        withTooltip(commands.title2, 'Encabezado 2 (ctrl + 2)'),
                                        withTooltip(commands.title3, 'Encabezado 3 (ctrl + 3)'),
                                        withTooltip(commands.title4, 'Encabezado 4 (ctrl + 4)'),
                                        withTooltip(commands.title5, 'Encabezado 5 (ctrl + 5)'),
                                        withTooltip(commands.title6, 'Encabezado 6 (ctrl + 6)'),
                                    ],
                                    {
                                        name: "title",
                                        groupName: "title",
                                        buttonProps: { "aria-label": "Insertar títulos...", "title": "Insertar títulos..." }
                                    }),
                                    withTooltip(commands.hr, 'Línea horizontal (ctrl + h)'),
                                    commands.divider,
                                    withTooltip(commands.unorderedListCommand, 'Lista sin orden (ctrl + shift + u)'),
                                    withTooltip(commands.orderedListCommand, 'Lista ordenada (ctrl + shift + o)'),
                                    withTooltip(commands.checkedListCommand, 'Lista con casillas (ctrl + shift + c)'),
                                    commands.divider,
                                    withTooltip(commands.link, 'Insertar enlace (ctrl + l)'),
                                    withTooltip(commands.quote, 'Insertar cita (ctrl + q)'),
                                    withTooltip(commands.code, 'Código en línea (ctrl + j)'),
                                    withTooltip(commands.codeBlock, 'Bloque de código (ctrl + shift + j)'),
                                ]}
                                extraCommands={[
                                    commands.divider, uploadMarkdownCommand, commands.divider,
                                    {
                                        ...withTooltip(commands.codeEdit, 'Editar (ctrl + 7)'),
                                        icon: (
                                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                            </svg>
                                        ),
                                    },
                                    {
                                        ...withTooltip(commands.codePreview, 'Vista previa (ctrl + 9)'),
                                        icon: (
                                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.822-2.214C4.433 4.33 6.09 2.5 8 2.5s3.567 1.83 5.005 3.286A13 13 0 0 1 14.827 8a13 13 0 0 1-1.822 2.214C11.567 11.67 9.91 13.5 8 13.5s-3.567-1.83-5.005-3.286A13 13 0 0 1 1.173 8"/>
                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                            </svg>
                                        ),
                                    },
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
        </>
    )
}

export default CreateOfertaPage
