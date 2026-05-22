import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'

const KanbanColumn = ({ titulo, estado, items }) => {
    return (
        <div className="kanban-column">
            <div className="kanban-column__header">
                <span className="kanban-column__title">{titulo}</span>
                <span className="kanban-column__count">{items.length}</span>
            </div>
            <Droppable droppableId={estado}>
                {(provided, snapshot) => (
                    <div
                        className={`kanban-column__cards${snapshot.isDraggingOver ? ' kanban-column__cards--over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {items.length === 0 && !snapshot.isDraggingOver
                            ? <p className="kanban-column__empty">Sin postulaciones</p>
                            : items.map((item, index) => (
                                <KanbanCard
                                    key={item.id_postulacion_estado}
                                    index={index}
                                    id={item.id_postulacion_estado}
                                    titulo={item.titulo}
                                    empresa={item.empresa}
                                    modalidad={item.modalidad}
                                />
                            ))
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default KanbanColumn
