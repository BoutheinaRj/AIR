/* eslint-disable react/prop-types */
import React from 'react'
import { COUNTRY_EMOJI_FONT, SETTINGS_COUNTRIES, SETTINGS_COUNTRY_OTHER } from './constants'

export function DashboardCandSettingsView({
	setSelectedView,
	settingsError,
	settingsMessage,
	settingsPhotoError,
	handleSaveProfile,
	settingsForm,
	candidateInitials,
	handleSettingsPhotoSelect,
	updateSettingsField,
	selectedCountryValue,
	isCustomCountry,
	settingsSaving,
	handleEditActiveGeneratedCv,
	settingsCvError,
	settingsCvMessage,
	setSettingsCvFile,
	settingsCvFile,
	handleUploadCvFromSettings,
	settingsCvUploading,
	passwordError,
	passwordMessage,
	handleChangePassword,
	passwordForm,
	updatePasswordField,
	passwordSaving,
}) {
	return (
		<div className='mt-8 space-y-5'>
			<div className='rounded-2xl border border-[#9fc3e1] bg-gradient-to-br from-[#f7fbff] via-[#edf6ff] to-[#deedfb] p-5 ring-1 ring-[#bdd8ef] shadow-[0_14px_34px_rgba(8,51,93,0.13)]'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div>
						<p className='text-lg font-bold text-[#0d355b]'>Paramètres</p>
						<p className='mt-1 text-sm text-[#4f7191]'>Modifie ton profil, ton CV et ton mot de passe.</p>
					</div>
					<button
						type='button'
						onClick={() => setSelectedView('cv')}
						className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
					>
						Voir mon CV
					</button>
				</div>
			</div>

			<div className='grid gap-5 lg:grid-cols-2'>
				<div className='rounded-2xl border border-[#b6cfe6] bg-[#f5faff] p-5 shadow-[0_8px_20px_rgba(8,51,93,0.08)]'>
					<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>PROFIL</p>
					{settingsError ? (
						<div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{settingsError}</div>
					) : null}
					{settingsMessage ? (
						<div className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800'>{settingsMessage}</div>
					) : null}
					{settingsPhotoError ? (
						<div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{settingsPhotoError}</div>
					) : null}

					<form className='mt-4 space-y-3' onSubmit={handleSaveProfile}>
						<div className='rounded-xl border border-slate-200 bg-slate-50/80 p-3'>
							<p className='mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600'>Photo de profil</p>
							<div className='flex flex-wrap items-center gap-3'>
								<div className='h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-[#00d4ff] to-[#1f7bff]'>
									{settingsForm.profileImage ? (
										<img src={settingsForm.profileImage} alt='Prévisualisation' className='h-full w-full object-cover' />
									) : (
										<div className='flex h-full w-full items-center justify-center text-sm font-bold text-white'>{candidateInitials}</div>
									)}
								</div>
								<div className='min-w-[220px] flex-1'>
									<input id='settings-profile-photo-input' type='file' accept='image/*' onChange={handleSettingsPhotoSelect} className='hidden' />
									<label htmlFor='settings-profile-photo-input' className='inline-flex cursor-pointer items-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#0a5f88] transition hover:bg-cyan-100'>
										Choisir une photo
									</label>
									<p className='mt-2 text-[11px] font-semibold text-slate-500'>JPG/PNG/WEBP, max 2MB</p>
									<div className='mt-2'>
										<button
											type='button'
											onClick={() => updateSettingsField('profileImage', '')}
											className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100'
										>
											Supprimer la photo
										</button>
									</div>
								</div>
							</div>
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Prénom</label>
								<input value={settingsForm.firstName} onChange={(e) => updateSettingsField('firstName', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Nom</label>
								<input value={settingsForm.lastName} onChange={(e) => updateSettingsField('lastName', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
						</div>
						<div>
							<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Email</label>
							<input type='email' value={settingsForm.email} onChange={(e) => updateSettingsField('email', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Pays</label>
								<select
									value={selectedCountryValue}
									onChange={(e) => {
										const nextValue = e.target.value
										if (nextValue === SETTINGS_COUNTRY_OTHER) {
											updateSettingsField('country', SETTINGS_COUNTRY_OTHER)
											return
										}
										updateSettingsField('country', nextValue)
									}}
									className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300'
									style={{ fontFamily: COUNTRY_EMOJI_FONT }}
								>
									<option value=''>Sélectionnez votre pays</option>
									{SETTINGS_COUNTRIES.map((item) => (
										<option key={item.value} value={item.value}>{item.label}</option>
									))}
									<option value={SETTINGS_COUNTRY_OTHER}>🌍 Autre (saisie manuelle)</option>
								</select>
								{isCustomCountry ? (
									<input
										value={settingsForm.country === SETTINGS_COUNTRY_OTHER ? '' : settingsForm.country}
										onChange={(e) => updateSettingsField('country', e.target.value)}
										placeholder='Saisissez votre pays'
										className='mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300'
									/>
								) : null}
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Date de naissance</label>
								<input type='date' value={settingsForm.birthDate} onChange={(e) => updateSettingsField('birthDate', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Titre</label>
								<input value={settingsForm.professionalTitle} onChange={(e) => updateSettingsField('professionalTitle', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Secteur</label>
								<input value={settingsForm.sector} onChange={(e) => updateSettingsField('sector', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
						</div>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Niveau</label>
								<select value={settingsForm.experienceLevel} onChange={(e) => updateSettingsField('experienceLevel', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300'>
									<option value='student'>Étudiant</option>
									<option value='junior'>Junior</option>
									<option value='confirmed'>Confirmé</option>
									<option value='senior'>Senior</option>
								</select>
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Portfolio (optionnel)</label>
								<input value={settingsForm.portfolioUrl} onChange={(e) => updateSettingsField('portfolioUrl', e.target.value)} placeholder='https://...' className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
						</div>
						<div className='pt-1'>
							<button type='submit' disabled={settingsSaving} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${settingsSaving ? 'bg-slate-300' : 'bg-[#001d3e] hover:opacity-95'}`}>
								{settingsSaving ? 'Sauvegarde…' : 'Enregistrer'}
							</button>
						</div>
					</form>
				</div>

				<div className='space-y-5'>
					<div className='rounded-2xl border border-[#b6cfe6] bg-[#f5faff] p-5 shadow-[0_8px_20px_rgba(8,51,93,0.08)]'>
						<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>REPRENDRE LE CV ACTUEL</p>
						<p className='mt-2 text-sm text-slate-600'>Rouvrez le CV actif dans l’éditeur pour le modifier ou repartir de l’extraction disponible.</p>
						<div className='mt-4'>
							<button type='button' onClick={handleEditActiveGeneratedCv} className='rounded-xl bg-[#001d3e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95'>
								Modifier le CV actuel
							</button>
						</div>
					</div>
					<div className='rounded-2xl border border-[#b6cfe6] bg-[#f5faff] p-5 shadow-[0_8px_20px_rgba(8,51,93,0.08)]'>
						<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>CHANGER DE CV</p>
						{settingsCvError ? (
							<div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{settingsCvError}</div>
						) : null}
						{settingsCvMessage ? (
							<div className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800'>{settingsCvMessage}</div>
						) : null}
						<div className='mt-4'>
							<input id='settings-cv-input' type='file' accept='application/pdf,text/html' onChange={(e) => setSettingsCvFile(e.target.files?.[0] || null)} className='hidden' />
							<label htmlFor='settings-cv-input' className='inline-flex cursor-pointer items-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#0a5f88] transition hover:bg-cyan-100'>
								Choisir un CV
							</label>
							{!settingsCvFile ? <p className='mt-2 text-[11px] font-semibold text-slate-500'>Aucun fichier choisi</p> : null}
							{settingsCvFile ? (
								<div className='mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700'>Fichier: {settingsCvFile.name}</div>
							) : null}
						</div>
						<div className='mt-3'>
							<button type='button' onClick={handleUploadCvFromSettings} disabled={settingsCvUploading} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${settingsCvUploading ? 'bg-slate-300' : 'bg-[#001d3e] hover:opacity-95'}`}>
								{settingsCvUploading ? 'Upload…' : 'Remplacer par un nouveau CV'}
							</button>
						</div>
					</div>
					<div className='rounded-2xl border border-[#b6cfe6] bg-[#f5faff] p-5 shadow-[0_8px_20px_rgba(8,51,93,0.08)]'>
						<p className='text-xs font-black tracking-[0.12em] text-[#0d355b]'>MOT DE PASSE</p>
						{passwordError ? (
							<div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800'>{passwordError}</div>
						) : null}
						{passwordMessage ? (
							<div className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800'>{passwordMessage}</div>
						) : null}
						<form className='mt-4 space-y-3' onSubmit={handleChangePassword}>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Mot de passe actuel</label>
								<input type='password' value={passwordForm.currentPassword} onChange={(e) => updatePasswordField('currentPassword', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Nouveau mot de passe</label>
								<input type='password' value={passwordForm.newPassword} onChange={(e) => updatePasswordField('newPassword', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
							<div>
								<label className='mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600'>Confirmer</label>
								<input type='password' value={passwordForm.confirmPassword} onChange={(e) => updatePasswordField('confirmPassword', e.target.value)} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-300' />
							</div>
							<div className='pt-1'>
								<button type='submit' disabled={passwordSaving} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${passwordSaving ? 'bg-slate-300' : 'bg-[#001d3e] hover:opacity-95'}`}>
									{passwordSaving ? 'Mise à jour…' : 'Changer le mot de passe'}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}
