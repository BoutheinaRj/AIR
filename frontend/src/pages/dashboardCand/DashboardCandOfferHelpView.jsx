/* eslint-disable react/prop-types */
import React from 'react'

export function DashboardCandOfferHelpView({
	selectedJob,
	sendOfferHelpMessage,
	offerHelpLoading,
	setOfferHelpChatId,
	setOfferHelpMessages,
	setOfferHelpError,
	offerHelpError,
	offerHelpMessages,
	candidateName,
	candidate,
	candidateInitials,
	offerHelpInput,
	setOfferHelpInput,
	handleOfferHelpSend,
	jobs,
	setSelectedJobId,
	offerHelpOfferText,
	setOfferHelpOfferText,
	setOfferHelpFile,
	offerHelpFile,
}) {
	return (
		<div className='mt-8 rounded-2xl border border-[#9fc3e1] bg-gradient-to-br from-[#f7fbff] via-[#edf6ff] to-[#deedfb] p-5 ring-1 ring-[#bdd8ef] shadow-[0_14px_34px_rgba(8,51,93,0.13)]'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<p className='text-lg font-bold text-[#0d355b]'>Aide pour une offre</p>
					<p className='mt-1 text-sm text-[#4f7191]'>Sélectionne une offre, puis reçois des conseils et une préparation à l’entretien.</p>
				</div>
				<div className='flex items-center gap-2'>
					{selectedJob ? (
						<button
							type='button'
							onClick={() =>
								sendOfferHelpMessage(
									`Je postule à l’offre “${selectedJob.title}”. Donne-moi des conseils concrets pour adapter mon CV et mon message de candidature. Ensuite liste les mots-clés/compétences à mettre en avant.`
								)
							}
							disabled={offerHelpLoading}
							className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${offerHelpLoading ? 'bg-slate-300' : 'bg-gradient-to-r from-[#0b3c72] to-[#0a5f88] hover:brightness-110'}`}
						>
							Conseils candidature
						</button>
					) : null}
					{selectedJob ? (
						<button
							type='button'
							onClick={() =>
								sendOfferHelpMessage(
									`Prépare-moi à un entretien pour l’offre “${selectedJob.title}”. Je veux: (1) 10 questions probables + bonnes réponses, (2) questions techniques si pertinent, (3) pitch 60 secondes, (4) questions à poser au recruteur.`
								)
							}
							disabled={offerHelpLoading}
							className={`rounded-xl border border-cyan-200/70 bg-cyan-50 px-4 py-2 text-xs font-semibold text-[#0a5f88] transition hover:bg-cyan-100 ${offerHelpLoading ? 'opacity-60' : ''}`}
						>
							Préparation entretien
						</button>
					) : null}
					<button
						type='button'
						onClick={() => {
							setOfferHelpChatId(null)
							setOfferHelpMessages([
								{ role: 'assistant', content: "Bonjour. Sélectionne une offre puis je t’aide à adapter ta candidature et te préparer à l’entretien." },
							])
							setOfferHelpError('')
						}}
						className='rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200'
					>
						Réinitialiser
					</button>
				</div>
			</div>

			{offerHelpError ? (
				<div className='mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{offerHelpError}</div>
			) : null}

			<div className='mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
				<div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
					<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>CONVERSATION</p>
					<div className='mt-3 max-h-[56vh] space-y-3 overflow-y-auto pr-1'>
						{offerHelpMessages.map((m, idx) => (
							<div key={`offer-help-msg-${idx}`} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								{m.role === 'assistant' ? (
									<div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0b2f57] to-[#134a84] text-[11px] font-black text-white shadow-sm'>AI</div>
								) : null}
								<div className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm ${m.role === 'user' ? 'border-[#8ee8ff] bg-gradient-to-br from-[#ddf7ff] to-[#f2fdff]' : 'border-[#d6e6f5] bg-gradient-to-br from-white to-[#f7fbff]'}`}>
									<p className='text-[11px] font-black tracking-[0.1em] text-[#5b7590]'>{m.role === 'user' ? candidateName : 'ASSISTANT IA'}</p>
									<p className='mt-1 whitespace-pre-wrap text-sm leading-7 text-[#173c62]'>{m.content}</p>
								</div>
								{m.role === 'user' ? (
									<div className='mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#00bfe7] to-[#1b6fe0] shadow-sm'>
										{candidate?.profileImage ? (
											<img src={candidate.profileImage} alt='Compte' className='h-full w-full object-cover' />
										) : (
											<div className='flex h-full w-full items-center justify-center text-[11px] font-bold text-white'>{candidateInitials}</div>
										)}
									</div>
								) : null}
							</div>
						))}
					</div>

					<div className='mt-4 flex flex-col gap-3 rounded-2xl border border-[#d6e6f5] bg-white/85 p-3 md:flex-row md:items-end'>
						<div className='flex-1'>
							<textarea
								rows={3}
								value={offerHelpInput}
								onChange={(e) => setOfferHelpInput(e.target.value)}
								placeholder='Ex: adapte mon CV à cette offre et prépare-moi à l’entretien…'
								className='w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-300'
							/>
						</div>
						<div className='flex items-center gap-3'>
							<div className='text-xs font-semibold text-[#6683a0]'>{offerHelpLoading ? 'En cours…' : selectedJob ? `Offre: ${selectedJob.title}` : 'Aucune offre sélectionnée'}</div>
							<button
								type='button'
								onClick={handleOfferHelpSend}
								disabled={offerHelpLoading || !offerHelpInput.trim()}
								className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${offerHelpLoading || !offerHelpInput.trim() ? 'bg-slate-300' : 'bg-gradient-to-r from-[#0fa7d6] to-[#1b6fe0] hover:brightness-110'}`}
							>
								Envoyer
							</button>
						</div>
					</div>
				</div>

				<div className='rounded-2xl border border-slate-200 bg-white p-4'>
					<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>CONTEXTE (OPTIONNEL)</p>
					<p className='mt-2 text-xs font-semibold text-slate-600'>Ajoute l’offre (texte) et/ou ton CV pour une réponse plus précise.</p>
					<div className='mt-3 space-y-3'>
						<div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
							<p className='text-xs font-black tracking-[0.12em] text-slate-600'>OFFRES D’EMPLOI</p>
							<p className='mt-2 text-xs font-semibold text-slate-600'>Sélectionne une offre pour lier le chat.</p>
							<div className='mt-3 max-h-[24vh] space-y-2 overflow-y-auto pr-1'>
								{jobs.length ? (
									jobs.map((j) => (
										<button
											type='button'
											key={j.id}
											onClick={() => setSelectedJobId(j.id)}
											className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${selectedJob?.id === j.id ? 'border-cyan-200 bg-white text-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
										>
											<div className='text-sm font-black text-[#103b62]'>{j.title}</div>
											<div className='mt-1 text-xs text-slate-500'>{j.location ? `${j.location} · ` : ''}{j.contractType || j.type || ''}</div>
										</button>
									))
								) : (
									<div className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600'>Aucune offre disponible.</div>
								)}
							</div>
						</div>
						<div>
							<p className='text-xs font-bold text-slate-700'>Offre d’emploi (texte)</p>
							<textarea
								rows={7}
								value={offerHelpOfferText}
								onChange={(e) => setOfferHelpOfferText(e.target.value)}
								placeholder='Colle ici la description de l’offre (missions, compétences, exigences)…'
								className='mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300'
							/>
						</div>
						<div>
							<p className='text-xs font-bold text-slate-700'>CV en PDF (optionnel)</p>
							<input id='offerhelp-cv-input' type='file' accept='application/pdf,text/html' onChange={(e) => setOfferHelpFile(e.target.files?.[0] || null)} className='hidden' />
							<label htmlFor='offerhelp-cv-input' className='mt-2 inline-flex cursor-pointer items-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#0a5f88] transition hover:bg-cyan-100'>
								Choisir un fichier
							</label>
							{!offerHelpFile ? <p className='mt-2 text-[11px] font-semibold text-slate-500'>Aucun fichier choisi</p> : null}
							{offerHelpFile ? (
								<div className='mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700'>Fichier: {offerHelpFile.name}</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
