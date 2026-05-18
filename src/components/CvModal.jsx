import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const CvModal = ({ blobUrl, filename, onClose }) => {
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

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
                disabled={currentPage <= 1}
              >
                ‹
              </button>
              <span className="cv-modal__page-label">{currentPage} / {numPages}</span>
              <button
                className="cv-modal__page-btn"
                onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))}
                title='Página siguiente'
                disabled={currentPage >= numPages}
              >
                ›
              </button>
            </div>
          )}
          {filename && <span className="cv-modal__filename" title={filename}>{filename}</span>}
          <button
            className="cv-modal__close"
            onClick={onClose}
            title='Cerrar'
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
