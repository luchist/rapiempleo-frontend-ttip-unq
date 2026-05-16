import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import KanbanColumn from '../components/board/KanbanColumn'

const BASE_URL = 'http://localhost:8080'

const COLUMNAS = [
    { label: 'Aplicado',      estado: 'Aplicado' },
    { label: 'Entrevistando', estado: 'Entrevistando' },
    { label: 'En espera',     estado: 'EsperandoRespuesta' },
    { label: 'Cerrado',       estado: 'Cerrado' },
    { label: 'Aceptado',      estado: 'Aceptado' },
]

const BoardPage = () => {
    const { id } = useParams()
    const [postulaciones, setPostulaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetch(`${BASE_URL}/postulante/${id}/board`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar el board')
                return res.json()
            })
            .then(data => {
                setPostulaciones(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [id])

    if (loading) return <p>Cargando board...</p>
    if (error)   return <p>Error: {error}</p>

    return (
        <div className="board-page">
            <h2 className="board-page__title">
                <span className="accent">▍</span>Mis postulaciones
            </h2>
            <div className="board-page__columns">
                {COLUMNAS.map(col => (
                    <KanbanColumn
                        key={col.estado}
                        titulo={col.label}
                        items={postulaciones.filter(p => p.estado === col.estado)}
                    />
                ))}
            </div>
        </div>
    )
}

export default BoardPage
