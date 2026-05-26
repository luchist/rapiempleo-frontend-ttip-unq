import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import KanbanColumn from '../components/board/KanbanColumn'
import { DragDropContext } from '@hello-pangea/dnd'

const BASE_URL = 'http://localhost:8080'

const COLUMNAS = [
    { label: 'Aplicado', estado: 'Aplicado' },
    { label: 'Entrevistando', estado: 'Entrevistando' },
    { label: 'En espera', estado: 'EsperandoRespuesta' },
    { label: 'Cerrado', estado: 'Cerrado' },
    { label: 'Aceptado', estado: 'Aceptado' },
]

const BoardPage = () => {
    const { id } = useParams()
    const [postulaciones, setPostulaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dragError, setDragError] = useState(null)
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

    const moveCardToColumn = (cardId, targetEstado, destIndex) => {
        const card = postulaciones.find(p => p.id_postulacion_estado === cardId)
        const withoutCard = postulaciones.filter(p => p.id_postulacion_estado !== cardId)
        const targetColumnItems = withoutCard.filter(p => p.estado === targetEstado)
        const otherItems = withoutCard.filter(p => p.estado !== targetEstado)
        targetColumnItems.splice(destIndex, 0, { ...card, estado: targetEstado })
        return [...otherItems, ...targetColumnItems]
    }

    const revertCardEstado = (prev, cardId, targetEstado, originalEstado) => {
        const card = prev.find(p => p.id_postulacion_estado === cardId)
        if (!card || card.estado !== targetEstado) return prev
        return prev.map(p =>
            p.id_postulacion_estado === cardId ? { ...p, estado: originalEstado } : p
        )
    }

    const reorderInColumn = (estado, sourceIndex, destIndex) => {
        const columnItems = postulaciones.filter(p => p.estado === estado)
        const [moved] = columnItems.splice(sourceIndex, 1)
        columnItems.splice(destIndex, 0, moved)
        const otherItems = postulaciones.filter(p => p.estado !== estado)
        return [...otherItems, ...columnItems]
    }

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result

        setDragError(null)

        const droppedOutside = !destination
        if (droppedOutside) return

        if (destination.droppableId === source.droppableId) {
            if (destination.index === source.index) return
            setPostulaciones(reorderInColumn(source.droppableId, source.index, destination.index))
            return
        }

        const targetEstado = destination.droppableId
        const cardId = Number(draggableId)

        const originalEstado = postulaciones.find(
            p => p.id_postulacion_estado === cardId
        )?.estado

        setPostulaciones(moveCardToColumn(cardId, targetEstado, destination.index))

        fetch(`${BASE_URL}/postulante/${id}/board/${cardId}?nuevoEstado=${targetEstado}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => { if (!res.ok) throw new Error('No se pudo actualizar el estado') })
            .catch(() => {
                setPostulaciones(prev => revertCardEstado(prev, cardId, targetEstado, originalEstado))
                setDragError("No se pudo actualizar la oferta. Intente nuevamente")
            })
    }

    if (loading) return <p>Cargando board...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <div className="board-page">
            <h2 className="board-page__title">
                <span className="accent">▍</span>Mis postulaciones
            </h2>
            {dragError && <p className="board-page__drag-error">{dragError}</p>}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="board-page__columns">
                    {COLUMNAS.map(col => (
                        <KanbanColumn
                            key={col.estado}
                            titulo={col.label}
                            estado={col.estado}
                            items={postulaciones.filter(p => p.estado === col.estado)}
                        />
                    ))}
                </div>
            </DragDropContext>
        </div>
    )
}

export default BoardPage