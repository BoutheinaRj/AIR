import React, { useEffect, useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const emptyOfferForm = {
	id: null,
	title: '',
	location: '',
	workMode: 'onsite',
	contractType: '',
	salary: '',
	description: '',
}

function DashboardRec() {
	const navigate = useNavigate()
	const [selectedView, setSelectedView] = useState('dashboard')
	const [recruiter, setRecruiter] = useState(null)
	const [offers, setOffers] = useState([])
	const [loadingOffers, setLoadingOffers] = useState(false)
	const [savingOffer, setSavingOffer] = useState(false)
	const [offerMessage, setOfferMessage] = useState('')
	const [offerError, setOfferError] = useState('')
	const [offerForm, setOfferForm] = useState(emptyOfferForm)

	useEffect(() => {
		const storedRecruiter = localStorage.getItem('airRecruiter')
		if (!storedRecruiter) {
			navigate('/connexion')
			return
		}

		try {
			setRecruiter(JSON.parse(storedRecruiter))
		} catch (error) {
			localStorage.removeItem('airRecruiter')
			navigate('/connexion')
		}
	}, [navigate])

	const fetchOffers = async (recruiterId) => {
		if (!recruiterId) return
		setLoadingOffers(true)
		setOfferError('')

		try {
			const response = await fetch(`${API_BASE}/offers?recruiterId=${recruiterId}`)
			const data = await response.json()

			if (!response.ok || !data.success) {
				setOfferError(data.message || 'Impossible de charger vos offres.')
				return
			}

			setOffers(data.offers || [])
		} catch (error) {
			setOfferError('Serveur indisponible. Verifiez que le backend tourne.')
		} finally {
			setLoadingOffers(false)
		}
	}

	useEffect(() => {
		if (recruiter?.id) {
			fetchOffers(recruiter.id)
		}
	}, [recruiter])

	const recruiterInitials = useMemo(() => {
		if (!recruiter) return 'R'
		const f = recruiter.firstName?.[0] || ''
		const l = recruiter.lastName?.[0] || ''
		return `${f}${l}`.toUpperCase() || 'R'
	}, [recruiter])

	const recruiterFullName = recruiter ? `${recruiter.firstName} ${recruiter.lastName}` : 'Recruteur'

	const stats = useMemo(() => {
		const remote = offers.filter((offer) => offer.workMode === 'remote').length
		const onsite = offers.filter((offer) => offer.workMode !== 'remote' && offer.workMode !== 'hybrid').length
		const hybrid = offers.filter((offer) => offer.workMode === 'hybrid').length

		return {
			total: offers.length,
			remote,
			onsite,
			hybrid,
		}
	}, [offers])

	const menuGroups = useMemo(
		() => [
			{
				title: 'PRINCIPAL',
				items: [
					{ key: 'dashboard', label: 'Dashboard', count: null },
					{ key: 'offers', label: 'Mes offres', count: stats.total },
					{ key: 'candidates', label: 'Candidats', count: 0 },
				],
			},
			{
				title: 'OUTILS',
				items: [
					{ key: 'ai', label: 'Recommandations IA', count: null },
					{ key: 'interviews', label: 'Entretiens', count: 0 },
				],
			},
			{
				title: 'COMPTE',
				items: [
					{ key: 'company', label: 'Entreprise', count: null },
					{ key: 'settings', label: 'Parametres', count: null },
				],
			},
		],
		[stats.total]
	)

	const updateOfferField = (field, value) => {
		setOfferForm((prev) => ({ ...prev, [field]: value }))
	}

	const resetOfferForm = () => {
		setOfferForm(emptyOfferForm)
	}

	const handleEditOffer = (offer) => {
		setOfferMessage('')
		setOfferError('')
		setSelectedView('offers')
		setOfferForm({
			id: offer._id,
			title: offer.title || '',
			location: offer.location || '',
			workMode: offer.workMode || 'onsite',
			contractType: offer.contractType || '',
			salary: offer.salary || '',
			description: offer.description || '',
		})
	}

	const handleSaveOffer = async (e) => {
		e.preventDefault()
		setOfferMessage('')
		setOfferError('')

		if (!offerForm.title || !offerForm.location || !offerForm.workMode || !offerForm.contractType || !offerForm.description) {
			setOfferError('Titre, localisation, mode, type de contrat et description sont requis.')
			return
		}

		try {
			setSavingOffer(true)

			const payload = {
				recruiterId: recruiter.id,
				title: offerForm.title,
				location: offerForm.location,
				workMode: offerForm.workMode,
				contractType: offerForm.contractType,
				salary: offerForm.salary,
				description: offerForm.description,
			}

			const isEditing = Boolean(offerForm.id)
			const response = await fetch(
				isEditing ? `${API_BASE}/offers/${offerForm.id}` : `${API_BASE}/offers`,
				{
					method: isEditing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				}
			)

			const data = await response.json()
			if (!response.ok || !data.success) {
				setOfferError(data.message || 'Action impossible sur l offre.')
				return
			}

			if (isEditing) {
				setOffers((prev) => prev.map((offer) => (offer._id === data.offer._id ? data.offer : offer)))
				setOfferMessage('Offre modifiee avec succes.')
			} else {
				setOffers((prev) => [data.offer, ...prev])
				setOfferMessage('Offre publiee avec succes.')
			}

			resetOfferForm()
		} catch (error) {
			setOfferError('Serveur indisponible. Verifiez que le backend tourne.')
		} finally {
			setSavingOffer(false)
		}
	}

	const handleDeleteOffer = async (offerId) => {
		setOfferMessage('')
		setOfferError('')

		try {
			const response = await fetch(`${API_BASE}/offers/${offerId}?recruiterId=${recruiter.id}`, {
				method: 'DELETE',
			})
			const data = await response.json()

			if (!response.ok || !data.success) {
				setOfferError(data.message || 'Suppression impossible.')
				return
			}

			setOffers((prev) => prev.filter((offer) => offer._id !== offerId))
			if (offerForm.id === offerId) {
				resetOfferForm()
			}
			setOfferMessage('Offre supprimee avec succes.')
		} catch (error) {
			setOfferError('Serveur indisponible. Verifiez que le backend tourne.')
		}
	}

	const handleMenuClick = (itemKey) => {
		if (itemKey === 'dashboard' || itemKey === 'offers') {
			setSelectedView(itemKey)
			return
		}
		setOfferMessage('')
		setOfferError('Cette section sera activee ensuite.')
	}

	const handleLogout = () => {
		localStorage.removeItem('airRecruiter')
		navigate('/connexion')
	}

	if (!recruiter) {
		return null
	}

	return (
		<section className='min-h-screen bg-gradient-to-br from-[#eaf8ff] via-[#f3fbff] to-[#eef4ff]' style={{ fontFamily: "'Jost', sans-serif" }}>
			<div className='mx-auto flex min-h-screen max-w-[1600px]'>
				<aside className='w-[286px] shrink-0 bg-gradient-to-b from-[#051a3d] via-[#072a56] to-[#083d69] px-4 py-6 text-white'>
					<div className='mb-2 flex items-center justify-center px-2'>
						<button
							type='button'
							onClick={() => navigate('/')}
							className='cursor-pointer'
							aria-label='Aller a l accueil'
						>
							<img src={assets.logo} alt='AIR logo' className='h-32 w-auto object-contain' />
						</button>
					</div>

					<div className='rounded-2xl border border-cyan-200/20 bg-white/10 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
						<div className='flex items-center gap-2'>
							<div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00d4ff] to-[#1f7bff] text-base font-bold'>
								{recruiterInitials}
							</div>
							<div className='min-w-0'>
								<p className='truncate text-[19px] leading-5 font-bold text-white'>{recruiterFullName}</p>
								<div className='mt-1 flex items-center gap-2'>
									<span className='text-xs text-cyan-100/90'>Recruteur - {recruiter.company}</span>
									<span className='rounded-full bg-cyan-100 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-[#045d7a]'>
										Recruteur
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-8 space-y-8'>
						{menuGroups.map((group) => (
							<div key={group.title}>
								<h3 className='mb-3 px-2 text-[12px] font-bold tracking-[0.12em] text-cyan-200/60'>{group.title}</h3>
								<ul className='space-y-2'>
									{group.items.map((item) => {
										const isActive = item.key === selectedView
										return (
											<li key={item.key}>
												<button
													type='button'
													onClick={() => handleMenuClick(item.key)}
													className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[16px] font-medium transition-all ${isActive ? 'bg-gradient-to-r from-[#00b8d9] to-[#1d88ff] text-white shadow-[0_8px_20px_rgba(0,184,217,0.35)]' : 'text-[#d2e7ff] hover:bg-white/10 hover:text-white'}`}
												>
													<span>{item.label}</span>
													{typeof item.count === 'number' ? <span className='rounded-full bg-white/15 px-2 py-[2px] text-[12px] font-semibold text-[#e6f5ff]'>{item.count}</span> : null}
												</button>
											</li>
										)
									})}
								</ul>
							</div>
						))}
					</div>

					<div className='mt-12 border-t border-cyan-200/20 pt-6'>
						<button
							type='button'
							onClick={handleLogout}
							className='flex w-full items-center rounded-xl px-3 py-2.5 text-[16px] font-medium text-[#d2e7ff] transition-all hover:bg-white/10 hover:text-white'
						>
							Deconnexion
						</button>
					</div>
				</aside>

				<main className='flex-1 p-6'>
					<div className='h-full rounded-3xl border border-[#cfe7f9] bg-white p-6 shadow-[0_15px_40px_rgba(8,51,93,0.08)]'>
						<p style={{ fontFamily: "'Jost', sans-serif" }} className='text-4xl font-black text-[#000000]'>Bienvenue 👋</p>
						<p className='mt-2 text-base text-[#36648b]'>
							{recruiter.firstName}, vos offres sont synchronisees entre Dashboard et Mes offres.
						</p>

						{offerError ? <div className='mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{offerError}</div> : null}
						{offerMessage ? <div className='mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'>{offerMessage}</div> : null}

						{selectedView === 'dashboard' ? (
							<div className='mt-8 space-y-6'>
								<div className='grid gap-4 md:grid-cols-4'>
									<div className='rounded-2xl border border-blue-100 bg-gradient-to-br from-[#edf4ff] to-[#dfeeff] p-4'>
										<p className='text-sm font-semibold text-[#2b5f9a]'>Offres publiees</p>
										<p className='mt-1 text-3xl font-black text-[#163f73]'>{stats.total}</p>
									</div>
									<div className='rounded-2xl border border-cyan-100 bg-gradient-to-br from-[#ecfbff] to-[#dbf5ff] p-4'>
										<p className='text-sm font-semibold text-[#0a6a8f]'>Remote</p>
										<p className='mt-1 text-3xl font-black text-[#083969]'>{stats.remote}</p>
									</div>
									<div className='rounded-2xl border border-cyan-100 bg-gradient-to-br from-[#ebfcff] to-[#d7f8ff] p-4'>
										<p className='text-sm font-semibold text-[#0a6a8f]'>Presentiel</p>
										<p className='mt-1 text-3xl font-black text-[#083969]'>{stats.onsite}</p>
									</div>
									<div className='rounded-2xl border border-cyan-100 bg-gradient-to-br from-[#f0fbff] to-[#dff7ff] p-4'>
										<p className='text-sm font-semibold text-[#0a6a8f]'>Hybride</p>
										<p className='mt-1 text-3xl font-black text-[#083969]'>{stats.hybrid}</p>
									</div>
								</div>

								<div className='rounded-2xl border border-[#d7e9f8] bg-[#fbfdff] p-5'>
									<div className='flex flex-wrap items-center justify-between gap-3'>
										<h2 className='text-xl font-black text-[#0d355b]'>Dernieres offres</h2>
										<button
											type='button'
											onClick={() => setSelectedView('offers')}
											className='rounded-xl border border-[#0a7aa2] px-4 py-2 text-sm font-semibold text-[#0a5f88] transition hover:bg-[#ebfaff]'
										>
											Publier une nouvelle offre
										</button>
									</div>
									{loadingOffers ? <p className='mt-3 text-sm text-[#4f7191]'>Chargement...</p> : null}
									{!loadingOffers && offers.length === 0 ? <p className='mt-3 text-sm text-[#4f7191]'>Aucune offre publiee pour le moment.</p> : null}
									{!loadingOffers && offers.length > 0 ? (
										<div className='mt-3 space-y-3'>
											{offers.slice(0, 4).map((offer) => (
												<div key={offer._id} className='rounded-xl border border-slate-200 bg-white p-3'>
													<div className='flex items-start justify-between gap-3'>
														<div>
															<p className='text-sm font-bold text-[#103b62]'>{offer.title}</p>
															<p className='mt-1 text-xs text-[#587a99]'>
																{offer.location} - {offer.workMode === 'remote' ? 'Remote' : offer.workMode === 'hybrid' ? 'Hybride' : 'Presentiel'} - {offer.contractType}
															</p>
														</div>
														<button
															type='button'
															onClick={() => handleEditOffer(offer)}
															className='rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-[#305b81] hover:bg-slate-50'
														>
															Modifier
														</button>
													</div>
												</div>
											))}
										</div>
									) : null}
								</div>
							</div>
						) : (
							<div className='mt-8 grid gap-6 lg:grid-cols-2'>
								<div className='rounded-2xl border border-[#d7e9f8] bg-[#fbfdff] p-5'>
									<h2 className='text-xl font-black text-[#0d355b]'>{offerForm.id ? 'Modifier une offre' : 'Publier une offre'}</h2>
									<p className='mt-1 text-sm text-[#4f7191]'>
										Titre, localisation, remote/presentiel/hybride, salaire optionnel et description.
									</p>

									<form className='mt-4 space-y-3' onSubmit={handleSaveOffer}>
										<input
											className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
											placeholder='Titre du poste'
											value={offerForm.title}
											onChange={(e) => updateOfferField('title', e.target.value)}
										/>
										<input
											className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
											placeholder='Localisation (ville/pays)'
											value={offerForm.location}
											onChange={(e) => updateOfferField('location', e.target.value)}
										/>
										<div className='grid gap-3 sm:grid-cols-2'>
											<select
												className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
												value={offerForm.workMode}
												onChange={(e) => updateOfferField('workMode', e.target.value)}
											>
												<option value='onsite'>Presentiel</option>
												<option value='remote'>Remote</option>
												<option value='hybrid'>Hybride</option>
											</select>
											<input
												className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
												placeholder='Type de contrat'
												value={offerForm.contractType}
												onChange={(e) => updateOfferField('contractType', e.target.value)}
											/>
										</div>
										<input
											className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
											placeholder='Salaire (optionnel)'
											value={offerForm.salary}
											onChange={(e) => updateOfferField('salary', e.target.value)}
										/>
										<textarea
											className='min-h-[130px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500'
											placeholder='Description du poste'
											value={offerForm.description}
											onChange={(e) => updateOfferField('description', e.target.value)}
										/>

										<div className='flex gap-2'>
											<button
												type='submit'
												disabled={savingOffer}
												className='rounded-xl bg-gradient-to-r from-[#0a4a72] to-[#0a7aa2] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'
											>
												{savingOffer ? 'Enregistrement...' : offerForm.id ? 'Enregistrer la modification' : 'Publier l offre'}
											</button>
											{offerForm.id ? (
												<button
													type='button'
													onClick={resetOfferForm}
													className='rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
												>
													Annuler
												</button>
											) : null}
										</div>
									</form>
								</div>

								<div className='rounded-2xl border border-[#d7e9f8] bg-[#fbfdff] p-5'>
									<h2 className='text-xl font-black text-[#0d355b]'>Offres publiees</h2>
									<p className='mt-1 text-sm text-[#4f7191]'>Vous pouvez voir, modifier et supprimer vos offres.</p>

									{loadingOffers ? <p className='mt-4 text-sm text-[#4f7191]'>Chargement des offres...</p> : null}
									{!loadingOffers && offers.length === 0 ? (
										<p className='mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-[#4f7191]'>Aucune offre pour le moment.</p>
									) : null}

									{!loadingOffers && offers.length > 0 ? (
										<div className='mt-4 space-y-3'>
											{offers.map((offer) => (
												<div key={offer._id} className='rounded-xl border border-slate-200 bg-white p-3'>
													<div className='flex items-start justify-between gap-3'>
														<div>
															<p className='text-sm font-bold text-[#103b62]'>{offer.title}</p>
															<p className='mt-1 text-xs text-[#587a99]'>
																{offer.location} - {offer.workMode === 'remote' ? 'Remote' : offer.workMode === 'hybrid' ? 'Hybride' : 'Presentiel'} - {offer.contractType}
																{offer.salary ? ` - ${offer.salary}` : ''}
															</p>
														</div>
														<span className='rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0a6a8f]'>Publiee</span>
													</div>
													<p className='mt-2 text-xs text-[#456786]'>{offer.description}</p>
													<div className='mt-3 flex gap-2'>
														<button
															type='button'
															onClick={() => handleEditOffer(offer)}
															className='rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50'
														>
															Modifier
														</button>
														<button
															type='button'
															onClick={() => handleDeleteOffer(offer._id)}
															className='rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100'
														>
															Supprimer
														</button>
													</div>
												</div>
											))}
										</div>
									) : null}
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</section>
	)
}

export default DashboardRec
