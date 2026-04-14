/* eslint-disable react/prop-types */
import React from 'react'
import { Badge } from './ui'

export function DashboardCandCvView({
	activeCvMeta,
	cvUrl,
	setSelectedView,
	cvLoading,
	cvHistoryLoading,
	cvHistoryError,
	cvError,
	cvHistory,
	selectedCvId,
	setSelectedCvId,
	setCvSource,
	setCvError,
	setCvUrl,
	selectedCvMeta,
	handleSetActiveCv,
	apiOrigin,
}) {
	return (
		<div className='mt-8 rounded-2xl border border-[#9fc3e1] bg-gradient-to-br from-[#f7fbff] via-[#edf6ff] to-[#deedfb] p-5 ring-1 ring-[#bdd8ef] shadow-[0_14px_34px_rgba(8,51,93,0.13)]'>
			<div className='flex items-start justify-between gap-3 flex-wrap'>
				<div>
					<p className='text-lg font-bold text-[#0d355b]'>Mon CV</p>
					<p className='mt-1 text-sm text-[#4f7191]'>
						{activeCvMeta?.source === 'uploaded' ? 'CV uploadé' : activeCvMeta?.source === 'generated' ? 'CV généré' : 'CV'}
						{activeCvMeta?._id ? ' · Historique activé' : ''}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					{cvUrl ? (
						<a
							href={cvUrl}
							target='_blank'
							rel='noreferrer'
							className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50'
						>
							Ouvrir dans un nouvel onglet
						</a>
					) : null}
					<button
						type='button'
						onClick={() => setSelectedView('offres')}
						className='rounded-xl bg-[#001d3e] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95'
					>
						← Retour aux offres
					</button>
				</div>
			</div>

			{cvLoading || cvHistoryLoading ? (
				<div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700'>Chargement…</div>
			) : null}
			{cvHistoryError ? (
				<div className='mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{cvHistoryError}</div>
			) : null}
			{cvError ? (
				<div className='mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{cvError}</div>
			) : null}

			{cvHistory.length > 0 ? (
				<div className='mt-5 grid gap-4 lg:grid-cols-[320px_1fr]'>
					<div className='rounded-2xl border border-slate-200 bg-white p-4'>
						<div className='flex items-center justify-between gap-2'>
							<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>HISTORIQUE</p>
							<Badge variant='slate'>{cvHistory.length}</Badge>
						</div>
						<div className='mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1'>
							{cvHistory.map((item) => {
								const id = String(item?._id || '')
								const isSelected = id && id === String(selectedCvId)
								const createdAt = item?.createdAt ? new Date(item.createdAt) : null
								const label = item?.source === 'uploaded' ? 'Upload' : item?.source === 'generated' ? 'Généré' : 'CV'
								return (
									<button
										key={id}
										type='button'
										onClick={() => {
											setSelectedCvId(id)
											setCvSource(item?.source || '')
											setCvError('')
											const path = item?.filePath || ''
											setCvUrl(path ? `${apiOrigin}${path}` : '')
											if (!path) setCvError('CV introuvable (fichier manquant).')
										}}
										className={`w-full rounded-2xl border px-3 py-2 text-left transition ${isSelected ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
									>
										<div className='flex items-start justify-between gap-2'>
											<div>
												<p className='text-sm font-black text-[#103b62]'>{label}</p>
												<p className='mt-0.5 text-xs font-semibold text-slate-500'>
													{createdAt ? createdAt.toLocaleString() : '—'}
												</p>
											</div>
											<div className='flex items-center gap-2'>
												{item?.isActive ? <Badge variant='emerald'>Actif</Badge> : null}
											</div>
										</div>
									</button>
								)
							})}
						</div>

						<div className='mt-4 flex items-center justify-between gap-2'>
							<div className='text-xs font-semibold text-slate-500'>
								{selectedCvMeta?.isActive ? 'Ce CV est utilisé pour postuler.' : 'Vous pouvez choisir ce CV pour postuler.'}
							</div>
							<button
								type='button'
								onClick={() => selectedCvId && handleSetActiveCv(selectedCvId)}
								disabled={!selectedCvId || Boolean(selectedCvMeta?.isActive)}
								className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition ${!selectedCvId || selectedCvMeta?.isActive ? 'bg-slate-300' : 'bg-[#001d3e] hover:opacity-95'}`}
							>
								Utiliser pour postuler
							</button>
						</div>
					</div>

					<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
						<div className='border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-700'>Aperçu</div>
						{cvUrl ? (
							<iframe title='Mon CV' src={cvUrl} className='w-full bg-white' style={{ height: '88vh' }} />
						) : (
							<div className='p-5 text-sm font-semibold text-slate-600'>Aperçu indisponible.</div>
						)}
					</div>
				</div>
			) : !cvHistoryLoading && !cvHistoryError ? (
				<div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700'>
					Aucun CV trouvé. Uploadez un CV ou générez-en un.
				</div>
			) : null}
		</div>
	)
}
