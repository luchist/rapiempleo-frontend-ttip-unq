const KanbanCard = ({ titulo, empresa, modalidad }) => {
    return (
        <div className="kanban-card">
            <div className="kanban-card__header">
                <span className="kanban-card__company accent">{empresa}</span>
                <h3 className="kanban-card__title">{titulo}</h3>
            </div>
            <div className="kanban-card__footer">
                <span className="kanban-card__modalidad">{modalidad}</span>
            </div>
        </div>
    )
}

export default KanbanCard
