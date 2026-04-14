/* eslint-disable react/prop-types */
import React from 'react'
import { formatQuizSeconds } from './helpers'

export function DashboardCandQuizModal({
	quizOpen,
	selectedJob,
	quizMeta,
	quizModeLabel,
	quizSecondsLeft,
	quizQuestions,
	quizAnswers,
	handleQuizAnswerChange,
	quizError,
	quizSubmitting,
	isApplying,
	onClose,
	handleSubmitQuizAndApply,
}) {
	if (!quizOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-[#00162f]/55 p-4'>
			<div
				className='max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,22,47,0.35)] select-none'
				onCopy={(e) => e.preventDefault()}
				onCut={(e) => e.preventDefault()}
				onPaste={(e) => e.preventDefault()}
				onContextMenu={(e) => e.preventDefault()}
			>
				<div className='border-b border-slate-200 bg-gradient-to-r from-[#f0f9ff] via-white to-[#eef6ff] px-5 py-4'>
					<div className='flex flex-wrap items-start justify-between gap-3'>
						<div>
							<p className='text-[11px] font-black uppercase tracking-[0.12em] text-[#5b7f9d]'>Quiz automatique</p>
							<h3 className='mt-1 text-lg font-black text-[#0d355b]'>{selectedJob?.title || 'Offre'}</h3>
							<p className='mt-1 text-xs text-[#4f7191]'>Questions generees automatiquement selon le domaine du poste.</p>
							{quizMeta?.domain ? <p className='mt-1 text-xs text-[#4f7191]'>Domaine detecte: {quizMeta.domain}</p> : null}
							<p className='mt-1 text-xs font-semibold text-[#0a5f88]'>Mode: {quizModeLabel || '8 questions / 8 min'}</p>
						</div>
						<div className='flex items-center gap-2'>
							<div className={`rounded-full border px-3 py-1 text-xs font-bold ${quizSecondsLeft <= 30 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-cyan-200 bg-cyan-50 text-cyan-700'}`}>
								Chrono: {formatQuizSeconds(quizSecondsLeft)}
							</div>
							<div className='rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700'>
								{quizQuestions.length} questions
							</div>
						</div>
					</div>
				</div>

				<div className='max-h-[60vh] overflow-y-auto px-5 py-4'>
					<div className='space-y-4'>
						{quizQuestions.map((q, index) => (
							<div key={q.id} className='rounded-xl border border-cyan-100 bg-gradient-to-br from-[#f8fdff] via-white to-[#f4fbff] p-4'>
								<p className='text-sm font-black text-[#103b62]'>
									Q{index + 1}. {q.question}
								</p>
								<div className='mt-3 grid gap-2'>
									{(q.options || []).map((opt) => {
										const checked = quizAnswers[q.id] === opt.key
										return (
											<label key={`${q.id}-${opt.key}`} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${checked ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
												<input
													type='radio'
													name={`quiz-${q.id}`}
													checked={checked}
													onChange={() => handleQuizAnswerChange(q.id, opt.key)}
													className='mt-1 h-4 w-4'
												/>
												<span className='text-slate-700'>{opt.text}</span>
											</label>
										)
									})}
								</div>
							</div>
						))}
					</div>

					{quizError ? <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800'>{quizError}</div> : null}
				</div>

				<div className='flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4'>
					<button type='button' onClick={onClose} className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
						Annuler
					</button>
					<button
						type='button'
						onClick={() => handleSubmitQuizAndApply()}
						disabled={quizSubmitting || isApplying || quizSecondsLeft <= 0}
						className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${quizSubmitting || isApplying || quizSecondsLeft <= 0 ? 'bg-slate-300' : 'bg-[#001d3e] hover:opacity-95'}`}
					>
						{quizSubmitting ? 'Correction en cours...' : isApplying ? 'Candidature en cours...' : 'Valider le quiz et postuler'}
					</button>
				</div>
			</div>
		</div>
	)
}
