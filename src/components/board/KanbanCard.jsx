import { Draggable } from '@hello-pangea/dnd'

const KanbanCard = ({ id, index, titulo, empresa, modalidad }) => {
    return (
        <Draggable draggableId={String(id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`kanban-card${snapshot.isDragging ? ' kanban-card--dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="kanban-card__header">
                        <span className="kanban-card__company accent">{empresa}</span>
                        <h3 className="kanban-card__title">{titulo}</h3>
                    </div>
                    <div className="kanban-card__footer">
                        <span className="kanban-card__modalidad">{modalidad}</span>
                    </div>
                </div>
            )}
        </Draggable>
    )
}

export default KanbanCard
