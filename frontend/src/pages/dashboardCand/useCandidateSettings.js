import { useCallback, useEffect, useMemo, useState } from 'react'
import { SETTINGS_COUNTRIES, SETTINGS_COUNTRY_OTHER } from './constants'

export function useCandidateSettings({ apiBase, candidate, setCandidate, setSelectedView }) {
	const [settingsForm, setSettingsForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		country: '',
		birthDate: '',
		professionalTitle: '',
		sector: '',
		experienceLevel: 'junior',
		portfolioUrl: '',
		profileImage: '',
	})
	const [settingsSaving, setSettingsSaving] = useState(false)
	const [settingsMessage, setSettingsMessage] = useState('')
	const [settingsError, setSettingsError] = useState('')
	const [settingsPhotoError, setSettingsPhotoError] = useState('')
	const [settingsCvFile, setSettingsCvFile] = useState(null)
	const [settingsCvUploading, setSettingsCvUploading] = useState(false)
	const [settingsCvMessage, setSettingsCvMessage] = useState('')
	const [settingsCvError, setSettingsCvError] = useState('')
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})
	const [passwordSaving, setPasswordSaving] = useState(false)
	const [passwordMessage, setPasswordMessage] = useState('')
	const [passwordError, setPasswordError] = useState('')

	useEffect(() => {
		if (!candidate) return
		const birth = candidate?.birthDate ? new Date(candidate.birthDate) : null
		const birthValue = birth && !Number.isNaN(birth.getTime()) ? birth.toISOString().slice(0, 10) : ''
		setSettingsForm({
			firstName: candidate?.firstName || '',
			lastName: candidate?.lastName || '',
			email: candidate?.email || '',
			country: candidate?.country || '',
			birthDate: birthValue,
			professionalTitle: candidate?.professionalTitle || '',
			sector: candidate?.sector || '',
			experienceLevel: candidate?.experienceLevel || 'junior',
			portfolioUrl: candidate?.portfolioUrl || '',
			profileImage: candidate?.profileImage || '',
		})
	}, [candidate])

	const isCustomCountry = useMemo(() => {
		const value = String(settingsForm.country || '').trim()
		if (!value) return false
		return !SETTINGS_COUNTRIES.some((item) => item.value === value)
	}, [settingsForm.country])

	const selectedCountryValue = isCustomCountry ? SETTINGS_COUNTRY_OTHER : String(settingsForm.country || '')

	const updateSettingsField = useCallback((field, value) => {
		setSettingsForm((prev) => ({ ...prev, [field]: value }))
	}, [])

	const handleSettingsPhotoSelect = useCallback((e) => {
		const file = e.target.files?.[0] || null
		if (!file) return

		setSettingsPhotoError('')
		if (!String(file.type || '').startsWith('image/')) {
			setSettingsPhotoError('Choisissez une image valide (JPG, PNG, WEBP...).')
			return
		}
		if (file.size > 2 * 1024 * 1024) {
			setSettingsPhotoError('Image trop volumineuse (max 2 MB).')
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			const dataUrl = typeof reader.result === 'string' ? reader.result : ''
			if (!dataUrl) {
				setSettingsPhotoError('Impossible de lire le fichier image.')
				return
			}
			updateSettingsField('profileImage', dataUrl)
		}
		reader.onerror = () => {
			setSettingsPhotoError('Impossible de lire le fichier image.')
		}
		reader.readAsDataURL(file)
	}, [updateSettingsField])

	const handleSaveProfile = useCallback(async (e) => {
		e.preventDefault()
		setSettingsMessage('')
		setSettingsError('')
		if (!candidate) {
			setSettingsError('Session candidat invalide.')
			return
		}
		const candidateId = candidate?.id || candidate?._id
		if (!candidateId) {
			setSettingsError('Session candidat invalide.')
			return
		}

		setSettingsSaving(true)
		try {
			const countryToSave = settingsForm.country === SETTINGS_COUNTRY_OTHER ? '' : settingsForm.country
			const res = await fetch(`${apiBase}/candidates/${candidateId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstName: settingsForm.firstName,
					lastName: settingsForm.lastName,
					email: settingsForm.email,
					country: countryToSave,
					birthDate: settingsForm.birthDate,
					professionalTitle: settingsForm.professionalTitle,
					sector: settingsForm.sector,
					experienceLevel: settingsForm.experienceLevel,
					portfolioUrl: settingsForm.portfolioUrl,
					profileImage: settingsForm.profileImage,
				}),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data?.success) {
				setSettingsError(data?.message || 'Impossible de sauvegarder le profil.')
				return
			}
			const nextCandidate = { ...(candidate || {}), ...(data.candidate || {}) }
			setCandidate(nextCandidate)
			localStorage.setItem('airCandidate', JSON.stringify(nextCandidate))
			setSettingsMessage(data?.message || 'Profil mis à jour.')
		} catch {
			setSettingsError('Serveur indisponible. Vérifiez que le backend tourne.')
		} finally {
			setSettingsSaving(false)
		}
	}, [apiBase, candidate, settingsForm, setCandidate])

	const handleUploadCvFromSettings = useCallback(async () => {
		setSettingsCvMessage('')
		setSettingsCvError('')
		if (!settingsCvFile) {
			setSettingsCvError('Choisissez un fichier CV (PDF/HTML).')
			return
		}
		const candidateId = candidate?.id || candidate?._id
		if (!candidateId) {
			setSettingsCvError('Session candidat invalide.')
			return
		}
		setSettingsCvUploading(true)
		try {
			const fd = new FormData()
			fd.append('candidateId', candidateId)
			fd.append('cvFile', settingsCvFile)
			const res = await fetch(`${apiBase}/cv/upload`, { method: 'POST', body: fd })
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data?.success) {
				setSettingsCvError(data?.message || 'Upload CV impossible.')
				return
			}

			let extractionMessage = ''
			try {
				const extractRes = await fetch(`${apiBase}/cv/extract/${encodeURIComponent(candidateId)}`)
				const extractData = await extractRes.json().catch(() => ({}))
				if (extractRes.ok && extractData?.success) {
					extractionMessage = 'Extraction terminée.'
				} else {
					extractionMessage = extractData?.message || 'Extraction lancée avec réserves.'
				}
			} catch {
				extractionMessage = 'Extraction indisponible pour le moment.'
			}

			setSettingsCvMessage(`${data?.message || 'CV uploadé.'} ${extractionMessage}`.trim())
			setSettingsCvFile(null)
			setSelectedView('cv')
		} catch {
			setSettingsCvError('Serveur indisponible. Vérifiez que le backend tourne.')
		} finally {
			setSettingsCvUploading(false)
		}
	}, [apiBase, candidate, settingsCvFile, setSelectedView])

	const updatePasswordField = useCallback((field, value) => {
		setPasswordForm((prev) => ({ ...prev, [field]: value }))
	}, [])

	const handleChangePassword = useCallback(async (e) => {
		e.preventDefault()
		setPasswordMessage('')
		setPasswordError('')
		const candidateId = candidate?.id || candidate?._id
		if (!candidateId) {
			setPasswordError('Session candidat invalide.')
			return
		}
		if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
			setPasswordError('Tous les champs mot de passe sont requis.')
			return
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordError('La confirmation ne correspond pas.')
			return
		}
		if (String(passwordForm.newPassword).length < 8) {
			setPasswordError('Le mot de passe doit contenir au moins 8 caractères.')
			return
		}

		setPasswordSaving(true)
		try {
			const res = await fetch(`${apiBase}/candidates/${candidateId}/password`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentPassword: passwordForm.currentPassword,
					newPassword: passwordForm.newPassword,
				}),
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data?.success) {
				setPasswordError(data?.message || 'Impossible de changer le mot de passe.')
				return
			}
			setPasswordMessage(data?.message || 'Mot de passe mis à jour.')
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
		} catch {
			setPasswordError('Serveur indisponible. Vérifiez que le backend tourne.')
		} finally {
			setPasswordSaving(false)
		}
	}, [apiBase, candidate, passwordForm])

	return {
		settingsForm,
		settingsSaving,
		settingsMessage,
		settingsError,
		settingsPhotoError,
		settingsCvFile,
		settingsCvUploading,
		settingsCvMessage,
		settingsCvError,
		setSettingsCvMessage,
		setSettingsCvError,
		passwordForm,
		passwordSaving,
		passwordMessage,
		passwordError,
		isCustomCountry,
		selectedCountryValue,
		setSettingsCvFile,
		updateSettingsField,
		handleSettingsPhotoSelect,
		handleSaveProfile,
		handleUploadCvFromSettings,
		updatePasswordField,
		handleChangePassword,
	}
}
