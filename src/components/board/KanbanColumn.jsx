import KanbanCard from './KanbanCard'

const KanbanColumn = ({ titulo, items }) => {
    return (
        <div className="kanban-column">
            <div className="kanban-column__header">
                <span className="kanban-column__title">{titulo}</span>
                <span className="kanban-column__count">{items.length}</span>
            </div>
            <div className="kanban-column__cards">
                {items.length === 0
                    ? <p className="kanban-column__empty">Sin postulaciones</p>
                    : items.map(item => (
                        <KanbanCard
                            key={item.id_oferta}
                            titulo={item.titulo}
                            empresa={item.empresa}
                            modalidad={item.modalidad}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default KanbanColumn
