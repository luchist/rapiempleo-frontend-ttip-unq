import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const CvModal = ({ blobUrl, filename, isFavorito, onSetFavorito, onClose }) => {
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
    setCurrentPage(1)
  }, [])

  return (
    <div className="cv-modal__overlay" onClick={onClose}>
      <div className="cv-modal__container" onClick={e => e.stopPropagation()} aria-modal="true" role="dialog">

        <div className="cv-modal__header">
          {numPages && numPages > 1 && (
            <div className="cv-modal__pagination">
              <button
                className="cv-modal__page-btn"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                title='Página anterior'
                aria-label='Página anterior'
                disabled={currentPage <= 1}
              >
                ‹
              </button>
              <span className="cv-modal__page-label">{currentPage} / {numPages}</span>
              <button
                className="cv-modal__page-btn"
                onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))}
                title='Página siguiente'
                aria-label='Página siguiente'
                disabled={currentPage >= numPages}
              >
                ›
              </button>
            </div>
          )}
          {filename && <span className="cv-modal__filename" title={filename}>{filename}</span>}
          <button
            className={`cv-modal__star${isFavorito ? ' cv-modal__star--active' : ''}`}
            onClick={onSetFavorito}
            title={isFavorito ? 'CV favorito actual' : 'Establecer como favorito'}
            aria-label={isFavorito ? 'CV favorito actual' : 'Establecer como favorito'}
            disabled={isFavorito}
          >
            ★
          </button>
          <button
            className="cv-modal__close"
            onClick={onClose}
            title='Cerrar'
            aria-label='Cerrar'
          >
            ✕
          </button>
        </div>

        <div className="cv-modal__body">
          <Document
            file={blobUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className="cv-modal__loading-text">Cargando CV...</p>}
            error={<p className="cv-modal__loading-text">No se pudo cargar el PDF.</p>}
          >
            <Page
              pageNumber={currentPage}
              width={680}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>

      </div>
    </div>
  )
}

export default CvModal
