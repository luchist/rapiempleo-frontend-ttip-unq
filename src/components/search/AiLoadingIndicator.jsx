const AiLoadingIndicator = () => (
  <div className="ai-loading">
    <div className="ai-loading__bars">
      <span className="ai-loading__bar" />
      <span className="ai-loading__bar" />
      <span className="ai-loading__bar" />
      <span className="ai-loading__bar" />
      <span className="ai-loading__bar" />
    </div>
    <p className="ai-loading__label">Analizando tu búsqueda con IA…</p>
  </div>
)

export default AiLoadingIndicator
