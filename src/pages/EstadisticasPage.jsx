import { useEffect, useState, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import UserContext from '../components/UserProvider'

const BASE_URL = 'http://localhost:8080'

// Orden canónico del pipeline de postulaciones. `varName` mapea cada estado a su
// token de color (definido en estadisticas.css, con variante para modo claro).
const ESTADOS = [
    { key: 'Aplicado', label: 'Aplicado', varName: '--stat-aplicado' },
    { key: 'Entrevistando', label: 'Entrevistando', varName: '--stat-entrevistando' },
    { key: 'EsperandoRespuesta', label: 'En espera', varName: '--stat-espera' },
    { key: 'Cerrado', label: 'Cerrado', varName: '--stat-cerrado' },
    { key: 'Aceptado', label: 'Aceptado', varName: '--stat-aceptado' },
]

// Geometría del donut (coordenadas del viewBox).
const R = 70
const SW = 24
const CX = 100
const CY = 100
const CIRC = 2 * Math.PI * R

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const IconCross = () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const EstadisticasPage = () => {
    const { user } = useContext(UserContext)
    const [postulaciones, setPostulaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const token = localStorage.getItem('token')
    const userId = user?.id

    useEffect(() => {
        if (!userId) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        setError(null)
        fetch(`${BASE_URL}/postulante/${userId}/board`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('No se pudieron cargar las estadísticas')
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
    }, [userId, token])

    const counts = useMemo(() => {
        const base = Object.fromEntries(ESTADOS.map(e => [e.key, 0]))
        for (const p of postulaciones) {
            if (base[p.estado] !== undefined) base[p.estado] += 1
        }
        return base
    }, [postulaciones])

    const total = postulaciones.length
    const aceptadas = counts.Aceptado
    const cerradas = counts.Cerrado
    const enProceso = counts.Aplicado + counts.Entrevistando + counts.EsperandoRespuesta
    const tasa = total > 0 ? Math.round((aceptadas / total) * 100) : 0
    const maxCount = Math.max(1, ...ESTADOS.map(e => counts[e.key]))
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0)

    if (!user) {
        return (
            <div className="stats-page">
                <p className="stats-page__message">Iniciá sesión como postulante para ver tus estadísticas.</p>
            </div>
        )
    }
    if (loading) return <div className="stats-page"><p className="stats-page__message">Cargando estadísticas...</p></div>
    if (error) return <div className="stats-page"><p className="stats-page__message stats-page__message--error">Error: {error}</p></div>

    // Segmentos visibles del donut (sólo estados con al menos una postulación).
    const visibles = ESTADOS.filter(e => counts[e.key] > 0)
    // Con un único segmento no dejamos hueco (evita un "sliver" antiestético).
    const gap = visibles.length > 1 ? 3 : 0
    // Prefijo acumulado sin mutar variables externas al render: cada segmento
    // guarda su `offset` (dónde arranca) y su `visible` (largo del trazo).
    const segmentos = visibles.reduce((segs, e) => {
        const prev = segs.length ? segs[segs.length - 1] : null
        const offset = prev ? prev.offset + prev.dash : 0
        const dash = (counts[e.key] / total) * CIRC
        return [...segs, { ...e, dash, offset, visible: Math.max(dash - gap, 0.001) }]
    }, [])

    return (
        <div className="stats-page">
            <h2 className="stats-page__title">
                <span className="accent">▍</span>Mis estadísticas
            </h2>

            {total === 0 ? (
                <div className="stats-empty">
                    <p className="stats-empty__title">Aún no tenés postulaciones</p>
                    <p className="stats-empty__hint">
                        Cuando te postules a ofertas, acá vas a ver cómo se distribuyen sus estados.
                    </p>
                    <Link to="/home" className="stats-empty__cta">Buscar ofertas</Link>
                </div>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="stats-kpis">
                        <div className="stat-tile">
                            <span className="stat-tile__value">{total}</span>
                            <span className="stat-tile__label">Postulaciones</span>
                        </div>
                        <div className="stat-tile">
                            <span className="stat-tile__value">{enProceso}</span>
                            <span className="stat-tile__label">En proceso</span>
                        </div>
                        <div className="stat-tile stat-tile--good">
                            <span className="stat-tile__value">{aceptadas}</span>
                            <span className="stat-tile__label"><IconCheck /> Aceptadas</span>
                        </div>
                        <div className="stat-tile stat-tile--bad">
                            <span className="stat-tile__value">{cerradas}</span>
                            <span className="stat-tile__label"><IconCross /> Cerradas</span>
                        </div>
                        <div className="stat-tile">
                            <span className="stat-tile__value">{tasa}%</span>
                            <span className="stat-tile__label">Tasa de aceptación</span>
                        </div>
                    </div>

                    <div className="stats-charts">
                        {/* Donut: distribución (parte-todo) */}
                        <section className="stats-card stats-donut" aria-label="Distribución de postulaciones por estado">
                            <div className="stats-donut__figure">
                                <svg viewBox="0 0 200 200" role="img" aria-hidden="true" className="stats-donut__svg">
                                    <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={SW}
                                        className="stats-donut__track" />
                                    {segmentos.map(e => (
                                        <circle key={e.key} cx={CX} cy={CY} r={R} fill="none"
                                            stroke={`var(${e.varName})`} strokeWidth={SW}
                                            strokeLinecap="butt"
                                            strokeDasharray={`${e.visible} ${CIRC - e.visible}`}
                                            strokeDashoffset={-e.offset}
                                            transform={`rotate(-90 ${CX} ${CY})`} />
                                    ))}
                                </svg>
                                <div className="stats-donut__center">
                                    <span className="stats-donut__total">{total}</span>
                                    <span className="stats-donut__caption">postulaciones</span>
                                </div>
                            </div>

                            <ul className="stats-legend">
                                {ESTADOS.map(e => (
                                    <li key={e.key} className="stats-legend__item">
                                        <span className="stats-legend__swatch" style={{ background: `var(${e.varName})` }} />
                                        <span className="stats-legend__label">
                                            {e.key === 'Aceptado' && <IconCheck />}
                                            {e.key === 'Cerrado' && <IconCross />}
                                            {e.label}
                                        </span>
                                        <span className="stats-legend__count">{counts[e.key]}</span>
                                        <span className="stats-legend__pct">{pct(counts[e.key])}%</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Barras: comparación de magnitud por estado */}
                        <section className="stats-card stats-bars" aria-label="Cantidad de postulaciones por estado">
                            {ESTADOS.map(e => (
                                <div key={e.key} className="stats-bar">
                                    <span className="stats-bar__label">{e.label}</span>
                                    <div className="stats-bar__track">
                                        <div className="stats-bar__fill"
                                            style={{
                                                width: `${(counts[e.key] / maxCount) * 100}%`,
                                                background: `var(${e.varName})`
                                            }} />
                                    </div>
                                    <span className="stats-bar__value">{counts[e.key]}</span>
                                </div>
                            ))}
                        </section>
                    </div>
                </>
            )}
        </div>
    )
}

export default EstadisticasPage
