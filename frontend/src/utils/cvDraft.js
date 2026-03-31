const LEGACY_DRAFT_KEY = 'airCandidateCvDraft'
const DRAFT_KEY_PREFIX = 'airCandidateCvDraft:'

const emptyDraft = {
	ownerCandidateId: '',
	personal: {
		firstName: '',
		lastName: '',
		professionalTitle: '',
		email: '',
		phone: '',
		city: '',
		country: '',
		linkedin: '',
		portfolio: '',
		birthDate: '',
		nationality: '',
		profileImageDataUrl: '',
	},
	content: {
		professionalSummary: '',

		// legacy simple fields
		education: '',
		experience: '',
		skills: '',

		// structured fields
		educationItems: [],
		experienceItems: [],
		languages: [],
		certifications: [],
		projects: [],
		qualities: [],
		interests: [],
	},
	savedAt: '',
}

function normalizeCandidateId(candidateId) {
	if (candidateId === null || candidateId === undefined) return ''
	return String(candidateId).trim()
}

export function getCvDraftKey(candidateId) {
	const id = normalizeCandidateId(candidateId)
	return id ? `${DRAFT_KEY_PREFIX}${id}` : LEGACY_DRAFT_KEY
}

function normalizeDraft(parsed) {
	if (!parsed || typeof parsed !== 'object') return { ...emptyDraft }
	return {
		...emptyDraft,
		...parsed,
		personal: { ...emptyDraft.personal, ...(parsed.personal || {}) },
		content: { ...emptyDraft.content, ...(parsed.content || {}) },
	}
}

function safeReadDraft(key) {
	try {
		const raw = localStorage.getItem(key)
		if (!raw) return null
		return normalizeDraft(JSON.parse(raw))
	} catch {
		return null
	}
}


export function loadCvDraft(candidateId) {
	const id = normalizeCandidateId(candidateId)
	const key = getCvDraftKey(id)

	const loaded = safeReadDraft(key)
	if (loaded) {
		if (id && loaded.ownerCandidateId && loaded.ownerCandidateId !== id) return { ...emptyDraft }
		return loaded
	}

	// Backward compatibility: never auto-load legacy drafts for a known candidate,
	// to avoid leaking data across users on shared browsers.
	if (id) return { ...emptyDraft }

	return safeReadDraft(LEGACY_DRAFT_KEY) || { ...emptyDraft }
}

export function saveCvDraft(candidateId, nextDraft) {
	try {
		const id = normalizeCandidateId(candidateId)
		const key = getCvDraftKey(id)
		const payload = {
			...loadCvDraft(id),
			...nextDraft,
			ownerCandidateId: id || (nextDraft?.ownerCandidateId ? normalizeCandidateId(nextDraft.ownerCandidateId) : ''),
			savedAt: new Date().toISOString(),
		}
		localStorage.setItem(key, JSON.stringify(payload))
		return payload
	} catch {
		return null
	}
}

export function clearCvDraft(candidateId) {
	try {
		localStorage.removeItem(getCvDraftKey(candidateId))
	} catch {
		// ignore
	}
}

export function clearLegacyCvDraft() {
	try {
		localStorage.removeItem(LEGACY_DRAFT_KEY)
	} catch {
		// ignore
	}
}
