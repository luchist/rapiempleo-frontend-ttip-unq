import { useState } from 'react'

const SearchBar = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue.trim())
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
      </div>
      <p className="search-bar__hint">
        ej: <span>titulo:</span> analista, <span>empresa:</span> Google, <span>modalidad:</span> Remoto, <span>ubicacion:</span> Buenos Aires
      </p>
    </div>
  )
}

export default SearchBar