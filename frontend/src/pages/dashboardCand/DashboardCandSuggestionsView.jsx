/* eslint-disable react/prop-types */
import React from 'react'
import { Badge } from './ui'

export function DashboardCandSuggestionsView({
	setSelectedView,
	handleAnalyzeCv,
	suggestionsLoading,
	candidate,
	suggestionsError,
	suggestionsHint,
	suggestionsData,
	normalizedSuggestions,
}) {
	return (
		<div className='suggestions-shell mt-8 rounded-2xl border p-5'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<p className='suggestions-title text-lg font-bold'>Suggestions</p>
					<p className='suggestions-subtitle mt-1 text-sm'>Analyse de votre CV et recommandations selon le marché (ATS, mots-clés, structure).</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={() => setSelectedView('cv')}
						className='suggestions-action-secondary rounded-xl border px-4 py-2 text-xs font-semibold transition'
					>
						Voir mon CV
					</button>
					<button
						type='button'
						onClick={handleAnalyzeCv}
						disabled={suggestionsLoading || !(candidate?.id || candidate?._id)}
						className={`suggestions-action-primary rounded-xl px-4 py-2 text-xs font-semibold text-white transition ${suggestionsLoading ? 'opacity-60' : 'hover:-translate-y-[1px]'}`}
					>
						{suggestionsLoading ? 'Analyse…' : 'Analyser mon CV'}
					</button>
				</div>
			</div>

			{suggestionsError ? (
				<div className='mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>
					<div>{suggestionsError}</div>
					{suggestionsHint ? <div className='mt-2 text-xs font-semibold text-rose-700'>{suggestionsHint}</div> : null}
				</div>
			) : null}

			{suggestionsData ? (
				<div className='mt-5 space-y-4'>
					<div className='suggestions-fade-up grid gap-4 sm:grid-cols-3'>
						<div className='suggestions-metric-card rounded-2xl border p-4'>
							<p className='suggestions-metric-label text-xs font-bold uppercase tracking-wide'>Points forts</p>
							<p className='suggestions-metric-value mt-1 text-3xl font-black'>{normalizedSuggestions.strengths.length}</p>
						</div>
						<div className='suggestions-metric-card rounded-2xl border p-4'>
							<p className='suggestions-metric-label text-xs font-bold uppercase tracking-wide'>Catégories</p>
							<p className='suggestions-metric-value mt-1 text-3xl font-black'>{Object.keys(normalizedSuggestions.recommendationsByCategory).length}</p>
						</div>
						<div className='suggestions-metric-card suggestions-metric-card--accent rounded-2xl border p-4'>
							<p className='suggestions-metric-label text-xs font-bold uppercase tracking-wide'>Rôle détecté</p>
							<p className='mt-1 text-base font-black text-white'>{normalizedSuggestions.detectedRole || 'Non déterminé'}</p>
						</div>
					</div>

					<div className='grid gap-4 xl:grid-cols-[0.92fr_1.28fr]'>
						<div className='space-y-4'>
							<div className='suggestions-panel suggestions-fade-up rounded-2xl border p-4'>
								<p className='suggestions-panel-title text-xs font-black tracking-[0.12em]'>SYNTHÈSE</p>
								<p className='suggestions-panel-hint mt-2 text-xs font-semibold'>Lecture rapide des points forts de votre CV.</p>
								{normalizedSuggestions.strengths.length > 0 ? (
									<ul className='suggestions-body-text mt-3 list-disc space-y-1 pl-5 text-sm'>
										{normalizedSuggestions.strengths.map((point, idx) => (
											<li key={`strength-${idx}`}>{point}</li>
										))}
									</ul>
								) : (
									<p className='suggestions-body-text mt-2 text-sm leading-7'>{normalizedSuggestions.summary || '—'}</p>
								)}
								{normalizedSuggestions.summary && normalizedSuggestions.strengths.length > 0 ? (
									<div className='suggestions-summary-box mt-4 rounded-xl border px-3 py-2 text-sm'>
										<p className='suggestions-panel-title text-xs font-black tracking-[0.12em]'>Résumé global</p>
										<p className='mt-2 leading-7'>{normalizedSuggestions.summary}</p>
									</div>
								) : null}
							</div>

							<div className='suggestions-panel suggestions-fade-up rounded-2xl border p-4'>
								<p className='suggestions-panel-title text-xs font-black tracking-[0.12em]'>PROFIL</p>
								<div className='mt-3 flex flex-wrap gap-2'>
									{normalizedSuggestions.detectedRole ? <Badge variant='cyan'>{normalizedSuggestions.detectedRole}</Badge> : null}
									{normalizedSuggestions.detectedLanguage ? <Badge variant='slate'>{normalizedSuggestions.detectedLanguage}</Badge> : null}
									<Badge variant='blue'>{Object.keys(normalizedSuggestions.recommendationsByCategory).length} catégories</Badge>
								</div>
							</div>
						</div>

						<div className='suggestions-reco-panel suggestions-fade-up rounded-2xl border p-4'>
							<div className='flex items-center justify-between gap-3'>
								<p className='suggestions-panel-title text-xs font-black tracking-[0.12em]'>RECOMMANDATIONS</p>
								<p className='suggestions-panel-hint text-xs font-semibold'>Par catégories</p>
							</div>
							<p className='suggestions-panel-hint mt-2 text-xs font-semibold'>Améliorations actionnables, organisées de façon claire.</p>
							<div className='suggestions-reco-scroll mt-4 space-y-3'>
								{Object.keys(normalizedSuggestions.recommendationsByCategory).length > 0 ? (
									Object.entries(normalizedSuggestions.recommendationsByCategory).map(([category, items]) => (
										<div key={category} className='suggestions-category-card rounded-2xl border p-4'>
											<p className='suggestions-category-title text-sm font-black'>{category}</p>
											<div className='mt-3 space-y-3'>
												{(items || []).map((s, idx) => {
													const title = s?.title || s?.label || 'Suggestion'
													const missing = s?.missing || s?.why || ''
													const recommendation = s?.recommendation || s?.example || ''
													const priority = s?.priority
													return (
														<div key={`${category}-${title}-${idx}`} className='suggestions-item-card rounded-xl border p-4'>
															<div className='flex items-start justify-between gap-3'>
																<p className='suggestions-item-title text-sm font-black'>{title}</p>
																{priority ? <Badge variant={priority === 'high' ? 'amber' : priority === 'low' ? 'slate' : 'blue'}>{priority}</Badge> : null}
															</div>
															{missing ? (
																<p className='suggestions-item-text mt-2 text-sm'>
																	<span className='suggestions-item-title font-bold'>Manque / problème:</span> {missing}
																</p>
															) : null}
															{recommendation ? (
																<div className='suggestions-item-callout mt-3 rounded-xl border px-3 py-2 text-sm'>
																	<span className='suggestions-item-title font-bold'>Recommandation:</span> {recommendation}
																</div>
															) : null}
														</div>
													)
												})}
											</div>
										</div>
									))
								) : (
									<p className='suggestions-empty-text text-sm font-semibold'>Aucune suggestion disponible.</p>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700'>
					Cliquez sur “Analyser mon CV” pour obtenir des suggestions.
				</div>
			)}
		</div>
	)
}
