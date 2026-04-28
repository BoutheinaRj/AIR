// frontend/src/pages/DashboardAdmin.jsx
// Add to router: <Route path="/admin/dashboard" element={<DashboardAdmin />} />
//
// IMPORTANT: In your Navbar.jsx, add this at the top of the component to hide
// the main navbar on admin pages:
//   const location = useLocation()
//   if (location.pathname.startsWith('/admin')) return null

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const ADMIN_REFRESH_MS = 45_000

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ values = [] }) {
  if (!values.length) return null
  const w = 200; const h = 40
  const max = Math.max(1, ...values)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(' ')
  const area = `M ${pts.split(' ')[0]} L ${pts} L ${w},${h} L 0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="skg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06d5e0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06d5e0" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#skg)" />
      <polyline fill="none" stroke="#06d5e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

function TrendPanel({ title, subtitle, values = [], labels = [], accent = '#06d5e0' }) {
  const width = 560
  const height = 300
  const padding = { top: 20, right: 24, bottom: 42, left: 24 }
  const safeValues = Array.isArray(values) ? values.map((value) => (Number.isFinite(value) ? value : 0)) : []
  const max = Math.max(1, ...safeValues)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const stepX = safeValues.length > 1 ? innerW / (safeValues.length - 1) : innerW
  const points = safeValues.map((value, index) => {
    const x = padding.left + index * stepX
    const y = padding.top + innerH - (value / max) * innerH
    return `${x},${y}`
  }).join(' ')
  const area = safeValues.length ? `M ${padding.left},${padding.top + innerH} L ${points} L ${padding.left + innerW},${padding.top + innerH} Z` : ''

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7f9d]">{title}</p>
          <p className="mt-1 text-lg font-black text-[#0d355b]">{subtitle}</p>
        </div>
        <Badge label={`max ${max}`} color="cyan" />
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px]">
          <defs>
            <linearGradient id="adminTrendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#e2e8f0" strokeWidth="1" />
          {area ? <path d={area} fill="url(#adminTrendArea)" /> : null}
          {points ? <polyline fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} /> : null}
          {safeValues.map((value, index) => {
            const x = padding.left + index * stepX
            const y = padding.top + innerH - (value / max) * innerH
            return (
              <g key={`${title}-${labels[index] || index}`}>
                <circle cx={x} cy={y} r="4.5" fill={accent} stroke="#fff" strokeWidth="2" />
                {index % 2 === 0 ? (
                  <text x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b">
                    {labels[index] || ''}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, large = false, highlight = false }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(8,51,93,0.07),0_0_0_1px_rgba(14,165,233,0.28),0_0_22px_rgba(6,182,212,0.24)] ${large ? 'min-h-[200px] md:min-h-[224px]' : 'min-h-[138px] md:min-h-[154px]'}`}>
      <div className="h-1.5 bg-gradient-to-r from-[#0ea5e9] via-[#06b6d4] to-[#1d4ed8]" />
      {highlight && (
        <div className="absolute right-3 top-3 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-[#045d7a]">Clé</div>
      )}
      <div className="flex h-full flex-col p-3.5 md:p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#5b7f9d]">{label}</p>
        <p className={`${large ? 'mt-3 text-4xl md:mt-4 md:text-5xl' : 'mt-2 text-[1.8rem] md:text-3xl'} font-black text-slate-900`}>{value ?? '—'}</p>
        {sub && <p className="mt-1 text-xs text-[#5b7f9d]">{sub}</p>}
        {trend && <div className="mt-auto pt-3 h-10"><Sparkline values={trend} /></div>}
      </div>
    </div>
  )
}

function InsightPanel({ title, subtitle, items = [], tone = 'cyan' }) {
  const toneClasses = {
    cyan: 'from-[#f7fcff] to-[#eef8ff]',
    amber: 'from-[#fffaf0] to-[#fff3d6]',
    emerald: 'from-[#f2fbf7] to-[#e8f9f0]',
    slate: 'from-[#f8fafc] to-[#edf2f7]',
  }

  return (
    <div className={`h-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${toneClasses[tone] || toneClasses.cyan} p-4 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] md:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7f9d]">{title}</p>
          <p className="mt-1 text-lg font-black text-[#0d355b]">{subtitle}</p>
        </div>
        <Badge label={`${items.length} points`} color={tone === 'amber' ? 'amber' : tone === 'emerald' ? 'green' : tone === 'slate' ? 'slate' : 'cyan'} />
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/70 bg-white/85 px-3 py-2 shadow-[0_8px_18px_rgba(8,51,93,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#103b62]">{item.label}</p>
                {item.description ? <p className="text-xs text-[#587a99]">{item.description}</p> : null}
              </div>
              <span className={`rounded-full px-2 py-[2px] text-[11px] font-semibold ${item.variant === 'danger' ? 'bg-red-50 text-red-700' : item.variant === 'success' ? 'bg-emerald-50 text-emerald-700' : item.variant === 'warning' ? 'bg-amber-50 text-amber-700' : item.variant === 'neutral' ? 'bg-slate-50 text-slate-700' : 'bg-cyan-50 text-cyan-700'}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-[#8aa3b9]">Aucun point à signaler.</p>}
      </div>
    </div>
  )
}

function ActivityPanel({ title, subtitle, items = [] }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7f9d]">{title}</p>
          <p className="mt-1 text-lg font-black text-[#0d355b]">{subtitle}</p>
        </div>
        <Badge label="Live" color="green" />
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.detail || item.date || ''}`} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#103b62]">{item.label}</p>
                <p className="text-xs text-[#587a99]">{item.detail}</p>
              </div>
              <span className="text-xs text-[#8aa3b9]">{item.date}</span>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-[#8aa3b9]">Aucune activité récente.</p>}
      </div>
    </div>
  )
}

function PipelineCard({ title, subtitle, steps = [] }) {
  const total = steps.reduce((sum, step) => sum + Number(step.count || 0), 0)
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7f9d]">{title}</p>
          <p className="mt-1 text-lg font-black text-[#0d355b]">{subtitle}</p>
        </div>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-[#0a5f88]">
          {total} total
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {steps.map((step) => {
          const count = Number(step.count || 0)
          const width = total && count > 0 ? `${Math.max(6, (count / total) * 100)}%` : '0%'
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#103b62]">{step.label}</span>
                <span className="text-xs font-black text-[#5b7f9d]">{count}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full transition-all" style={{ width, background: step.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-cyan-100 bg-gradient-to-r from-[#f7fcff] to-[#ecf7ff] px-5 py-4">
          <h3 className="text-base font-black text-[#0d355b]">{title}</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Fermer</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color = 'cyan' }) {
  const cls = {
    cyan:   'border-cyan-200 bg-cyan-50 text-cyan-700',
    green:  'border-emerald-200 bg-emerald-50 text-emerald-700',
    red:    'border-red-200 bg-red-50 text-red-700',
    amber:  'border-amber-200 bg-amber-50 text-amber-700',
    slate:  'border-slate-200 bg-slate-50 text-slate-600',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  }
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls[color] || cls.slate}`}>
      {label}
    </span>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  const r = Math.round(rating || 0)
  return (
    <span className="text-amber-400">
      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
      <span className="ml-1 text-xs text-slate-500">{Number(rating || 0).toFixed(1)}</span>
    </span>
  )
}

// ─── Shared table header ──────────────────────────────────────────────────────
function TH({ children }) {
  return <th className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#5b7f9d]">{children}</th>
}

const VIEWS = ['overview', 'recruiters', 'candidates', 'offers', 'candidacies','formations', 'feedback']
const VIEW_LABELS = {
  overview: 'Vue globale', recruiters: 'Recruteurs', candidates: 'Candidats',
  offers: 'Offres', candidacies: 'Candidatures', formations: 'Formations', feedback: 'Feedback',
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [admin, setAdmin]     = useState(null)
  const [view, setView]       = useState('overview')
  const [search, setSearch]   = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [currentTime, setCurrentTime]   = useState(new Date())

  const [stats, setStats]               = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [pipeline, setPipeline]         = useState(null)
  const [recruiters, setRecruiters]     = useState([])
  const [candidates, setCandidates]     = useState([])
  const [offers, setOffers]             = useState([])
  const [candidacies, setCandidacies]   = useState([])
  const [formations, setFormations]     = useState([])
  const [feedbacks, setFeedbacks]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')

  // Modal
  const [modal, setModal]         = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [warningMsg, setWarningMsg] = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('airAdmin')
    if (!stored) { navigate('/connexion'); return }
    try { setAdmin(JSON.parse(stored)) }
    catch { localStorage.removeItem('airAdmin'); navigate('/connexion') }
  }, [navigate])

  const adminHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-admin-id': admin?.id || admin?._id || '',
  }), [admin])

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}/admin${path}`, { ...opts, headers: { ...adminHeaders, ...opts.headers } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) throw new Error(data.message || 'Erreur serveur.')
    return data
  }, [adminHeaders])

  const flash = useCallback((msg, isError = false) => {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }, [])

  const loadOverview = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await apiFetch('/stats')
      setStats(data.stats)
      setPipeline(data.pipeline || null)
      setLastSyncedAt(new Date())
    } catch (e) {
      flash(e.message, true)
    } finally {
      setStatsLoading(false)
    }
  }, [apiFetch, flash])

  const loadSection = useCallback(async (targetView, { resetSearch = false } = {}) => {
    if (targetView === 'overview') {
      await loadOverview()
      return
    }

    setLoading(true)
    if (resetSearch) setSearch('')

    const map = {
      recruiters:  () => apiFetch('/recruiters').then(d => setRecruiters(d.recruiters)),
      candidates:  () => apiFetch('/candidates').then(d => setCandidates(d.candidates)),
      offers:      () => apiFetch('/offers').then(d => setOffers(d.offers)),
      formations:  () => apiFetch('/formations').then(d => setFormations(d.formations)),
      candidacies: () => apiFetch('/candidacies').then(d => setCandidacies(d.candidacies)),
      feedback:    () => apiFetch('/feedback').then(d => setFeedbacks(d.feedbacks)),
    }

    try {
      await map[targetView]?.()
      setLastSyncedAt(new Date())
    } catch (e) {
      flash(e.message, true)
    } finally {
      setLoading(false)
    }
  }, [apiFetch, flash, loadOverview])

  useEffect(() => {
    if (!admin) return
    loadSection(view, { resetSearch: true })
  }, [admin, view, loadSection])

  useEffect(() => {
    if (!admin) return
    const interval = setInterval(() => {
      loadSection(view, { resetSearch: false })
    }, ADMIN_REFRESH_MS)

    return () => clearInterval(interval)
  }, [admin, view, loadSection])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

  const filtered = useCallback((rows, keys) => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => keys.some(k => String(r[k] || '').toLowerCase().includes(q)))
  }, [search])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleDelete = async (endpoint, id, setter) => {
    if (!window.confirm('Confirmer la suppression définitive ?')) return
    try {
      await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
      setter(prev => prev.filter(x => x._id !== id))
      flash('Supprimé avec succès.')
      void loadOverview()
    } catch (e) { flash(e.message, true) }
  }

  const handleBan = async (type, item) => {
    const action = item.banned ? 'unban' : 'ban'
    try {
      await apiFetch(`/${type}/${item._id}/${action}`, { method: 'POST' })
      const setter = type === 'recruiters' ? setRecruiters : setCandidates
      setter(prev => prev.map(x => x._id === item._id ? { ...x, banned: !item.banned } : x))
      flash(item.banned ? 'Utilisateur débanni.' : 'Utilisateur banni.')
      void loadOverview()
    } catch (e) { flash(e.message, true) }
  }

  const handleSendWarning = async (type, item) => {
    if (!warningMsg.trim()) { flash('Entrez un message d\'avertissement.', true); return }
    setSaving(true)
    try {
      await apiFetch(`/${type}/${item._id}/warning`, {
        method: 'POST',
        body: JSON.stringify({ message: warningMsg }),
      })
      flash('Avertissement envoyé par email.')
      setModal(null); setWarningMsg('')
      void loadOverview()
    } catch (e) { flash(e.message, true) }
    finally { setSaving(false) }
  }

  const handleEditSave = async (type, id) => {
    setSaving(true)
    try {
      const isFormation = type === 'formations'
      const endpoint = isFormation ? (id ? `/${type}/${id}` : `/${type}`) : `/${type}/${id}`
      const method = isFormation && !id ? 'POST' : 'PUT'
      const data = await apiFetch(endpoint, { method, body: JSON.stringify(editForm) })
      const keyMap = { recruiters: 'recruiter', candidates: 'candidate', offers: 'offer', formations: 'formation' }
      const setterMap = { recruiters: setRecruiters, candidates: setCandidates, offers: setOffers, formations: setFormations }
      const nextItem = data[keyMap[type]] || editForm
      if (isFormation && !id) {
        setterMap[type](prev => [nextItem, ...prev])
      } else {
        setterMap[type](prev => prev.map(x => x._id === (id || nextItem._id) ? { ...x, ...nextItem } : x))
      }
      flash('Modifications enregistrées.')
      setModal(null)
      void loadOverview()
    } catch (e) { flash(e.message, true) }
    finally { setSaving(false) }
  }

  const openEdit = (type, item) => { setEditForm({ ...item }); setModal({ type: `edit-${type}`, data: item }) }
  const openFormationCreate = () => {
    setEditForm({
      title: '',
      description: '',
      provider: 'A.I.R',
      category: '',
      level: 'beginner',
      duration: '',
      imageUrl: '',
      tags: '',
      status: 'published',
    })
    setModal({ type: 'edit-formations', data: null })
  }
  const openWarn = (type, item) => { setWarningMsg(''); setModal({ type: `warn-${type}`, data: item }) }

  const adminName = admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email : ''
  const syncLabel = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'jamais'

  const overviewCandidacyStages = [
    { label: 'Appliquées', count: pipeline?.candidacies?.applied ?? 0, color: '#06d5e0' },
    { label: 'En revue', count: pipeline?.candidacies?.reviewed ?? 0, color: '#0ea5e9' },
    { label: 'Acceptées', count: pipeline?.candidacies?.accepted ?? 0, color: '#1d4ed8' },
    { label: 'Refusées', count: pipeline?.candidacies?.rejected ?? 0, color: '#ef4444' },
  ]

  const overviewOfferStages = [
    { label: 'Publiées', count: pipeline?.offers?.published ?? 0, color: '#10b981' },
    { label: 'Brouillons', count: pipeline?.offers?.draft ?? 0, color: '#94a3b8' },
  ]

  const overviewTrainingStages = [
    { label: 'Déposées', count: pipeline?.trainingApplications?.applied ?? 0, color: '#06b6d4' },
    { label: 'Acceptées', count: pipeline?.trainingApplications?.accepted ?? 0, color: '#22c55e' },
    { label: 'Refusées', count: pipeline?.trainingApplications?.rejected ?? 0, color: '#ef4444' },
    { label: 'Retirées', count: pipeline?.trainingApplications?.withdrawn ?? 0, color: '#64748b' },
  ]

  const adminJourneyStages = [
    { label: 'Créées', count: stats?.totalOffers ?? 0, color: '#0ea5e9' },
    { label: 'Candidatures', count: stats?.totalCandidacies ?? 0, color: '#06d5e0' },
    { label: 'SBERT scorées', count: stats?.scoredCandidacies ?? 0, color: '#1d4ed8' },
    { label: 'Feedback', count: stats?.feedbackCount ?? 0, color: '#10b981' },
  ]

  const adminAlerts = [
    {
      label: 'Candidatures à traiter',
      value: `${Math.max(0, Number(stats?.totalCandidacies || 0) - Number(stats?.scoredCandidacies || 0))}`,
      description: 'Candidatures non scorées ou non revues',
      variant: Number(stats?.totalCandidacies || 0) > Number(stats?.scoredCandidacies || 0) ? 'warning' : 'success',
    },
    {
      label: 'Offres en brouillon',
      value: `${pipeline?.offers?.draft ?? 0}`,
      description: 'Publications non encore visibles côté candidats',
      variant: (pipeline?.offers?.draft ?? 0) > 0 ? 'warning' : 'success',
    },
    {
      label: 'Formations actives',
      value: `${pipeline?.trainings?.published ?? 0}`,
      description: 'Parcours de formation disponibles dans la base',
      variant: 'cyan',
    },
    {
      label: 'Feedbacks reçus',
      value: `${stats?.feedbackCount ?? 0}`,
      description: 'Retour utilisateur sur l’application',
      variant: Number(stats?.feedbackCount || 0) > 0 ? 'success' : 'warning',
    },
  ]

  const adminActivity = [
    ...(stats?.recentRecruiters || []).slice(0, 3).map((recruiter) => ({
      label: `${recruiter.firstName || ''} ${recruiter.lastName || ''}`.trim() || recruiter.email,
      detail: recruiter.company || recruiter.email,
      date: fmt(recruiter.createdAt),
    })),
    ...(stats?.recentCandidates || []).slice(0, 3).map((candidate) => ({
      label: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email,
      detail: candidate.email,
      date: fmt(candidate.createdAt),
    })),
  ].slice(0, 5)

  const totalCandidacies = Number(stats?.totalCandidacies || 0)
  const scoredCandidacies = Number(stats?.scoredCandidacies || 0)
  const reviewedCandidacies = Number(pipeline?.candidacies?.reviewed || 0)
  const acceptedCandidacies = Number(pipeline?.candidacies?.accepted || 0)
  const rejectedCandidacies = Number(pipeline?.candidacies?.rejected || 0)
  const publishedOffers = Number(pipeline?.offers?.published || 0)
  const draftOffers = Number(pipeline?.offers?.draft || 0)
  const totalOffersFlow = publishedOffers + draftOffers
  const trainingApplied = Number(pipeline?.trainingApplications?.applied || 0)
  const trainingAccepted = Number(pipeline?.trainingApplications?.accepted || 0)

  const pendingCandidacies = Math.max(0, totalCandidacies - scoredCandidacies)
  const scoringRate = totalCandidacies > 0 ? Math.round((scoredCandidacies / totalCandidacies) * 100) : 0
  const publicationRate = totalOffersFlow > 0 ? Math.round((publishedOffers / totalOffersFlow) * 100) : 0
  const trainingAcceptanceRate = trainingApplied > 0 ? Math.round((trainingAccepted / trainingApplied) * 100) : 0

  const processingRateValues = [
    totalCandidacies > 0 ? Math.round((scoredCandidacies / totalCandidacies) * 100) : 0,
    totalCandidacies > 0 ? Math.round((reviewedCandidacies / totalCandidacies) * 100) : 0,
    totalCandidacies > 0 ? Math.round((acceptedCandidacies / totalCandidacies) * 100) : 0,
    totalCandidacies > 0 ? Math.round((rejectedCandidacies / totalCandidacies) * 100) : 0,
  ]

  const capacityTrendValues = [
    Number(pipeline?.offers?.published || 0),
    Number(pipeline?.offers?.draft || 0),
    Number(pipeline?.trainings?.published || 0),
    Number(pipeline?.trainingApplications?.applied || 0),
  ]

  if (!admin) return null

  return (
    <section
      className="candidate-dashboard h-screen bg-gradient-to-br from-[#eaf8ff] via-[#f3fbff] to-[#eef4ff]"
      style={{
        fontFamily: "'Jost', sans-serif",
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        zIndex: 9999,
      }}
    >
      <div className="flex h-full min-h-0 w-full">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="candidate-dashboard__sidebar flex h-full self-stretch w-[286px] shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-[#051a3d] via-[#072a56] to-[#083d69] px-4 py-6 text-white">
          <div className="mb-2 flex items-center justify-center px-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer"
              aria-label="Aller a l accueil"
            >
              <img src={assets.logo} alt="AIR logo" className="h-28 w-auto object-contain" />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.03),0_0_18px_rgba(6,182,212,0.28)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00d4ff] to-[#1f7bff] text-base font-black">
              {(admin.firstName?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[19px] leading-5 font-bold text-white">{adminName}</p>
              <span className="rounded-full bg-cyan-100 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-[#045d7a]">
                {admin.role || 'admin'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="mb-2 px-2 text-[12px] font-bold uppercase tracking-[0.12em] text-cyan-200/60">Navigation</p>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[16px] font-medium transition-all ${
                  view === v
                    ? 'bg-gradient-to-r from-[#00b8d9] to-[#1d88ff] text-white shadow-[0_8px_20px_rgba(0,184,217,0.35)]'
                    : 'text-[#d2e7ff] hover:bg-white/10 hover:text-white'
                }`}>
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-cyan-200/20 pt-5">
            <button
              onClick={() => { localStorage.removeItem('airAdmin'); navigate('/connexion') }}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-[16px] font-medium text-[#d2e7ff] hover:bg-white/10 hover:text-white"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="flex-1 h-full min-h-0 overflow-y-auto p-6">
          <div className="candidate-dashboard__panel min-h-full w-full rounded-3xl border border-[#cfe7f9] bg-white p-6 shadow-[0_15px_40px_rgba(8,51,93,0.08)]">

            {/* Header (rendered outside overview only) */}
            {view !== 'overview' ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-4xl font-black text-[#000000]">{VIEW_LABELS[view]}</p>
                  <p className="mt-1 text-base text-[#36648b]">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="candidate-dashboard__time inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-[#0a5f88]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#06d5e0]" />
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · sync {syncLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => loadSection(view, { resetSearch: false })}
                    className="candidate-dashboard__ghost-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Actualiser
                  </button>
                </div>
              </div>
            ) : null}

            {view !== 'overview' && (
              <div className="mt-4 flex justify-end">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Flash */}
            {error   && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            {loading && <p className="mt-6 text-sm text-[#4f7191]">Chargement...</p>}

            {/* ── OVERVIEW ────────────────────────────────────────────── */}
            {view === 'overview' && (
              <div className="mt-6 space-y-6 lg:space-y-7">
                {statsLoading ? <p className="text-sm text-[#4f7191]">Chargement des statistiques...</p> : stats ? (
                  <>
                    <div className="rounded-[28px] border border-[#d8eaf8] bg-gradient-to-br from-[#f8fdff] via-[#fbfeff] to-[#eef7ff] p-4 shadow-[0_0_0_1px_rgba(14,165,233,0.12)] md:p-5 lg:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
                        <div>
                          <p className="text-3xl font-black text-[#000000] md:text-4xl">{VIEW_LABELS[view]}</p>
                          <p className="mt-1 text-base text-[#36648b]">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="candidate-dashboard__time inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-[#0a5f88]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#06d5e0]" />
                            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · sync {syncLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => loadSection(view, { resetSearch: false })}
                            className="candidate-dashboard__ghost-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Actualiser
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
                        <StatCard label="Recruteurs"      value={stats.totalRecruiters} />
                        <StatCard label="Candidats"       value={stats.totalCandidates} />
                        <StatCard label="Offres publiées" value={stats.totalOffers} />
                        <StatCard label="Candidatures"    value={stats.totalCandidacies} sub={`${stats.scoredCandidacies} scorées SBERT`} />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">A traiter</p>
                          <p className="mt-1 text-2xl font-black text-amber-900">{pendingCandidacies}</p>
                          <p className="text-xs text-amber-700">candidatures en attente</p>
                        </div>
                        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-700">Taux scoring</p>
                          <p className="mt-1 text-2xl font-black text-cyan-900">{scoringRate}%</p>
                          <p className="text-xs text-cyan-700">couverture du scoring</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Offres publiées</p>
                          <p className="mt-1 text-2xl font-black text-emerald-900">{publicationRate}%</p>
                          <p className="text-xs text-emerald-700">vs brouillons</p>
                        </div>
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Acceptation formation</p>
                          <p className="mt-1 text-2xl font-black text-indigo-900">{trainingAcceptanceRate}%</p>
                          <p className="text-xs text-indigo-700">demandes validées</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid items-start gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                      <div className="space-y-4 lg:space-y-5">
                        <TrendPanel
                          title="Courbe admin"
                          subtitle="Activité opérationnelle sur 14 jours"
                          values={stats.trendValues}
                          labels={stats.trendLabels}
                          accent="#06d5e0"
                        />

                        <div className="grid gap-4 xl:grid-cols-2 items-stretch">
                          <TrendPanel
                            title="Performance de traitement"
                            subtitle="Taux de scoring et de décision (%)"
                            values={processingRateValues}
                            labels={['Scoring', 'Revue', 'Acceptées', 'Refusées']}
                            accent="#1d4ed8"
                          />
                          <TrendPanel
                            title="Capacité plateforme"
                            subtitle="Offres et formations en volume"
                            values={capacityTrendValues}
                            labels={['Offres publiées', 'Brouillons', 'Formations', 'Demandes']}
                            accent="#10b981"
                          />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2 items-stretch">
                          <div>
                            <StatCard
                              label="Candidatures / 14 jours"
                              value={stats.trendValues?.reduce((a, b) => a + b, 0) ?? 0}
                              sub="Flux réel sur les 14 derniers jours"
                              trend={stats.trendValues}
                              large
                              highlight
                            />
                          </div>
                          <PipelineCard
                            title="Pipeline candidatures"
                            subtitle="Du dépôt à la décision"
                            steps={overviewCandidacyStages}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 items-stretch">
                          <PipelineCard
                            title="Pipeline offres"
                            subtitle="Cycle de publication"
                            steps={overviewOfferStages}
                          />
                          <PipelineCard
                            title="Pipeline formations"
                            subtitle="Demandes d'inscription"
                            steps={overviewTrainingStages}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 lg:space-y-5">
                        <InsightPanel
                          title="Priorité admin"
                          subtitle="Points d’attention immédiats"
                          items={adminAlerts}
                          tone="amber"
                        />
                        <PipelineCard
                          title="Lecture admin"
                          subtitle="Vue transverse du backlog"
                          steps={adminJourneyStages}
                        />
                        <StatCard
                          label="Note moyenne app"
                          value={stats.avgRating ? `${stats.avgRating}/5` : '—'}
                          sub={`${stats.feedbackCount} avis déposés`}
                        />
                        <ActivityPanel
                          title="Activité récente"
                          subtitle="Nouveaux profils inscrits"
                          items={adminActivity}
                        />
                      </div>
                    </div>
                  </>
                ) : <p className="text-sm text-[#8aa3b9]">Aucune statistique disponible.</p>}
              </div>
            )}

            {/* ── RECRUITERS ──────────────────────────────────────────── */}
            {view === 'recruiters' && !loading && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><TH>Nom</TH><TH>Email</TH><TH>Entreprise</TH><TH>Inscrit</TH><TH>Statut</TH><TH>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {filtered(recruiters, ['firstName', 'lastName', 'email', 'company']).map(r => (
                      <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-[#103b62]">{`${r.firstName || ''} ${r.lastName || ''}`.trim() || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{r.email || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{r.company || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{fmt(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Badge label={r.banned ? 'Banni' : 'Actif'} color={r.banned ? 'red' : 'green'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => openEdit('recruiters', r)} className="rounded-md border border-cyan-300 bg-white px-2 py-1 text-xs font-semibold text-[#0a5f88] hover:bg-cyan-50">Modifier</button>
                            <button onClick={() => handleBan('recruiters', r)} className={`rounded-md border px-2 py-1 text-xs font-semibold ${r.banned ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>{r.banned ? 'Débannir' : 'Bannir'}</button>
                            <button onClick={() => openWarn('recruiters', r)} className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Avertir</button>
                            <button onClick={() => handleDelete('/recruiters', r._id, setRecruiters)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered(recruiters, ['firstName', 'lastName', 'email', 'company']).length && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucun recruteur.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CANDIDATES ──────────────────────────────────────────── */}
            {view === 'candidates' && !loading && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><TH>Nom</TH><TH>Email</TH><TH>Secteur</TH><TH>Niveau</TH><TH>Inscrit</TH><TH>Statut</TH><TH>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {filtered(candidates, ['firstName', 'lastName', 'email', 'sector']).map(c => (
                      <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-[#103b62]">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{c.email || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{c.sector || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{c.experienceLevel || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{fmt(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Badge label={c.banned ? 'Banni' : 'Actif'} color={c.banned ? 'red' : 'green'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => openEdit('candidates', c)} className="rounded-md border border-cyan-300 bg-white px-2 py-1 text-xs font-semibold text-[#0a5f88] hover:bg-cyan-50">Modifier</button>
                            <button onClick={() => handleBan('candidates', c)} className={`rounded-md border px-2 py-1 text-xs font-semibold ${c.banned ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>{c.banned ? 'Débannir' : 'Bannir'}</button>
                            <button onClick={() => openWarn('candidates', c)} className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Avertir</button>
                            <button onClick={() => handleDelete('/candidates', c._id, setCandidates)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered(candidates, ['firstName', 'lastName', 'email']).length && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucun candidat.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── OFFERS ──────────────────────────────────────────────── */}
            {view === 'offers' && !loading && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><TH>Titre</TH><TH>Recruteur</TH><TH>Lieu</TH><TH>Mode</TH><TH>Statut</TH><TH>Créée</TH><TH>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {filtered(offers, ['title', 'location', 'workMode']).map(o => (
                      <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-[#103b62]">{o.title || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">
                          {o.recruiterId ? `${o.recruiterId.firstName || ''} ${o.recruiterId.lastName || ''}`.trim() || o.recruiterId.email : '—'}
                        </td>
                        <td className="px-4 py-3 text-[#587a99]">{o.location || '—'}</td>
                        <td className="px-4 py-3"><Badge label={o.workMode || '—'} color="cyan" /></td>
                        <td className="px-4 py-3"><Badge label={o.status || '—'} color={o.status === 'published' ? 'green' : 'slate'} /></td>
                        <td className="px-4 py-3 text-[#587a99]">{fmt(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit('offers', o)} className="rounded-md border border-cyan-300 bg-white px-2 py-1 text-xs font-semibold text-[#0a5f88] hover:bg-cyan-50">Modifier</button>
                            <button onClick={() => handleDelete('/offers', o._id, setOffers)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered(offers, ['title', 'location']).length && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucune offre.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CANDIDACIES ─────────────────────────────────────────── */}
            {view === 'candidacies' && !loading && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><TH>Candidat</TH><TH>Offre</TH><TH>Statut</TH><TH>Score SBERT</TH><TH>Score Quiz</TH><TH>Postulé le</TH></tr>
                  </thead>
                  <tbody>
                    {candidacies.map(c => (
                      <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-[#103b62]">
                          {c.candidateId ? `${c.candidateId.firstName || ''} ${c.candidateId.lastName || ''}`.trim() || c.candidateId.email : '—'}
                        </td>
                        <td className="px-4 py-3 text-[#587a99]">{c.jobOfferId?.title || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge label={c.status || '—'}
                            color={c.status === 'accepted' ? 'green' : c.status === 'rejected' ? 'red' : c.status === 'reviewed' ? 'amber' : 'slate'} />
                        </td>
                        <td className="px-4 py-3">
                          {c.sbertScore != null
                            ? <span className={`font-black ${c.sbertScore >= 75 ? 'text-emerald-600' : c.sbertScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.sbertScore}%</span>
                            : <span className="text-[#c4d4e0]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[#587a99]">{c.quizScore != null ? `${c.quizScore}%` : '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{fmt(c.createdAt)}</td>
                      </tr>
                    ))}
                    {!candidacies.length && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucune candidature.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── FEEDBACK ────────────────────────────────────────────── */}
            {view === 'feedback' && !loading && (
              <div className="mt-6 space-y-5">
                {feedbacks.length > 0 && (() => {
                  const avg = feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / feedbacks.length
                  const dist = [1, 2, 3, 4, 5].map(s => feedbacks.filter(f => Math.round(f.rating) === s).length)
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_0_0_1px_rgba(14,165,233,0.2)]">
                      <div className="flex flex-wrap items-center gap-8">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7f9d]">Note moyenne</p>
                          <p className="mt-1 text-4xl font-black text-[#0d355b]">{avg.toFixed(1)}</p>
                          <Stars rating={avg} />
                        </div>
                        <div className="flex-1 min-w-[180px] space-y-1.5">
                          {[5, 4, 3, 2, 1].map(s => (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <span className="w-4 text-[#5b7f9d]">{s}★</span>
                              <div className="flex-1 rounded-full bg-slate-100" style={{ height: 6 }}>
                                <div className="rounded-full bg-[#06d5e0]" style={{ height: 6, width: `${(dist[s - 1] / feedbacks.length) * 100}%` }} />
                              </div>
                              <span className="w-4 text-right text-[#8aa3b9]">{dist[s - 1]}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-[#5b7f9d]">{feedbacks.length} avis</p>
                      </div>
                    </div>
                  )
                })()}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr><TH>Utilisateur</TH><TH>Rôle</TH><TH>Note</TH><TH>Commentaire</TH><TH>Date</TH><TH>Action</TH></tr>
                    </thead>
                    <tbody>
                      {filtered(feedbacks, ['userId', 'userRole', 'comment']).map(f => (
                        <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-[#587a99]">{f.userId || '—'}</td>
                          <td className="px-4 py-3"><Badge label={f.userRole || '—'} color={f.userRole === 'recruiter' ? 'indigo' : 'cyan'} /></td>
                          <td className="px-4 py-3"><Stars rating={f.rating} /></td>
                          <td className="max-w-xs px-4 py-3 text-[#587a99]"><span className="block truncate">{f.comment || '—'}</span></td>
                          <td className="px-4 py-3 text-[#587a99]">{fmt(f.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete('/feedback', f._id, setFeedbacks)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Supprimer</button>
                          </td>
                        </tr>
                      ))}
                      {!filtered(feedbacks, ['userId', 'comment']).length && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucun feedback.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          {view === 'formations' && !loading && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#0d355b]">Formations</p>
                  <p className="mt-1 text-sm text-[#8aa3b9]">Créez les parcours visibles par les candidats et suivez les inscriptions.</p>
                </div>
                <button onClick={openFormationCreate} className="rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                  Nouvelle formation
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><TH>Titre</TH><TH>Catégorie</TH><TH>Niveau</TH><TH>Statut</TH><TH>Candidats</TH><TH>Créée</TH><TH>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {filtered(formations, ['title', 'provider', 'category']).map(f => (
                      <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-[#103b62]">
                          <p>{f.title || '—'}</p>
                          <p className="mt-1 max-w-md truncate text-xs text-[#8aa3b9]">{f.provider || 'A.I.R'}</p>
                        </td>
                        <td className="px-4 py-3 text-[#587a99]">{f.category || '—'}</td>
                        <td className="px-4 py-3 text-[#587a99]">{f.level || '—'}</td>
                        <td className="px-4 py-3"><Badge label={f.status || '—'} color={f.status === 'published' ? 'green' : 'slate'} /></td>
                        <td className="px-4 py-3 text-[#587a99]">{f.applicationsCount ?? 0}</td>
                        <td className="px-4 py-3 text-[#587a99]">{fmt(f.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => openEdit('formations', { ...f, tags: Array.isArray(f.tags) ? f.tags.join(', ') : f.tags || '' })} className="rounded-md border border-cyan-300 bg-white px-2 py-1 text-xs font-semibold text-[#0a5f88] hover:bg-cyan-50">Modifier</button>
                            <button onClick={() => handleDelete('/formations', f._id, setFormations)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered(formations, ['title', 'provider', 'category']).length && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#8aa3b9]">Aucune formation.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}

      {modal?.type === 'edit-recruiters' && (
        <Modal title="Modifier le recruteur" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[['Prénom','firstName'],['Nom','lastName'],['Email','email'],['Entreprise','company'],['Secteur','sector'],['Pays','country']].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">{label}</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                  value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button onClick={() => handleEditSave('recruiters', modal.data._id)} disabled={saving}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1d4ed8] py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === 'edit-candidates' && (
        <Modal title="Modifier le candidat" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[['Prénom','firstName'],['Nom','lastName'],['Email','email'],['Secteur','sector'],['Titre professionnel','professionalTitle']].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">{label}</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                  value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button onClick={() => handleEditSave('candidates', modal.data._id)} disabled={saving}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1d4ed8] py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === 'edit-offers' && (
        <Modal title="Modifier l'offre" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[['Titre','title'],['Localisation','location'],['Compétences techniques','technicalSkills'],['Expérience requise','experienceRequired'],['Langues requises','languagesRequired'],['Salaire','salary']].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">{label}</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                  value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Mode de travail</label>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.workMode || 'onsite'} onChange={e => setEditForm(p => ({ ...p, workMode: e.target.value }))}>
                <option value="onsite">Présentiel</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybride</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Statut</label>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.status || 'published'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <option value="published">Publiée</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Description</label>
              <textarea rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <button onClick={() => handleEditSave('offers', modal.data._id)} disabled={saving}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1d4ed8] py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === 'edit-formations' && (
        <Modal title={modal.data?._id ? 'Modifier la formation' : 'Créer une formation'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[
              ['Titre', 'title'],
              ['Organisme', 'provider'],
              ['Catégorie', 'category'],
              ['Durée', 'duration'],
              ['Image URL', 'imageUrl'],
              ['Tags (séparés par des virgules)', 'tags'],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">{label}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                  value={editForm[key] || ''}
                  onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Niveau</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.level || 'beginner'}
                onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Statut</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.status || 'published'}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="published">Publiée</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#4f7191]">Description</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                value={editForm.description || ''}
                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <button onClick={() => handleEditSave('formations', modal.data?._id)} disabled={saving}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#1d4ed8] py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? 'Enregistrement...' : 'Enregistrer la formation'}
            </button>
          </div>
        </Modal>
      )}

      {(modal?.type === 'warn-recruiters' || modal?.type === 'warn-candidates') && (
        <Modal
          title={`Avertissement — ${modal.data.firstName || ''} ${modal.data.lastName || ''}`.trim()}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <p className="text-sm text-[#4f7191]">Ce message sera envoyé par email à l'utilisateur.</p>
            <textarea rows={5} placeholder="Motif de l'avertissement..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              value={warningMsg} onChange={e => setWarningMsg(e.target.value)} />
            <button
              onClick={() => handleSendWarning(modal.type === 'warn-recruiters' ? 'recruiters' : 'candidates', modal.data)}
              disabled={saving || !warningMsg.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? 'Envoi...' : 'Envoyer l\'avertissement'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}