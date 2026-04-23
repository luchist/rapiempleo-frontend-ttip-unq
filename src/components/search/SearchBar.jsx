import { useState } from 'react'

const SparkleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2a.75.75 0 0 1 .716.526l1.786 5.54a3.25 3.25 0 0 0 2.053 2.053l5.54 1.786a.75.75 0 0 1 0 1.432l-5.54 1.786a3.25 3.25 0 0 0-2.053 2.053l-1.786 5.54a.75.75 0 0 1-1.432 0l-1.786-5.54a3.25 3.25 0 0 0-2.053-2.053l-5.54-1.786a.75.75 0 0 1 0-1.432l5.54-1.786a3.25 3.25 0 0 0 2.053-2.053l1.786-5.54A.75.75 0 0 1 12 2Z" />
  </svg>
)

const SearchBar = ({ onSearch, onAiSearch }) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue.trim())
    }
  }

  const handleAiClick = () => {
    if (onAiSearch) {
      onAiSearch(inputValue.trim())
    }
  }

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <svg className="search-bar__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-bar__input"
          type="text"
          placeholder="Buscar ofertas de trabajo..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="search-bar__ai-btn"
          onClick={handleAiClick}
          title="Búsqueda inteligente con IA"
          type="button"
        >
          <SparkleIcon />
          <span>IA</span>
        </button>
      </div>
      <p className="search-bar__hint">
        ej: <span>titulo:</span> analista, <span>empresa:</span> Google, <span>modalidad:</span> Remoto, <span>ubicacion:</span> Buenos Aires
      </p>
    </div>
  )
}

export default SearchBar
