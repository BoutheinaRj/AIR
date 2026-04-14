const toStringList = (value) => {
	if (!value) return []
	if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
	if (typeof value === 'string') {
		return value
			.split(/\r?\n/)
			.map((line) => line.replace(/^\s*[-•]\s*/, '').trim())
			.filter(Boolean)
	}
	return [String(value).trim()].filter(Boolean)
}

const categoryFromText = (text) => {
	const t = (text || '').toLowerCase()
	if (/(formation|éducation|education|dipl[oô]me|universit|certif|ecole|école)/.test(t)) return 'Formation'
	if (/(skill|comp[ée]tence|competence|stack|technolog|framework|outil|language|langage|technique|backend|frontend|devops|cloud|sql|react|node|java|python)/.test(t)) {
		if (/(soft|communication|leadership|team|équipe|gestion|organisation|autonomie|rigueur|relation)/.test(t)) return 'Compétences (soft skills)'
		return 'Compétences techniques (skills)'
	}
	if (/(exp[ée]rience|experience|emploi|poste|stage|mission|responsabilit)/.test(t)) return 'Expérience'
	if (/(projet|portfolio|github|gitlab|lien|site|demo|d[ée]mo)/.test(t)) return 'Projets & Portfolio'
	if (/(ats|mot[- ]?cl[ée]s|keywords|structure|format|mise en page|rubrique|section|resume|résumé)/.test(t)) return 'Structure & ATS'
	if (/(langue|anglais|fran[çc]ais|arab|niveau linguist)/.test(t)) return 'Langues'
	return 'Autres'
}

export const formatQuizSeconds = (totalSeconds) => {
	const safe = Math.max(0, Number(totalSeconds) || 0)
	const minutes = Math.floor(safe / 60)
	const seconds = safe % 60
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const parseSalaryRange = (value) => {
	const text = String(value || '').trim()
	if (!text) return null
	const matches = [...text.matchAll(/(\d+(?:[\.,]\d+)?)(\s*[kK])?/g)]
	if (!matches.length) return null
	const numbers = matches
		.map((m) => {
			const raw = String(m[1] || '').replace(',', '.')
			let n = Number.parseFloat(raw)
			if (!Number.isFinite(n)) return null
			if (m[2]) n *= 1000
			return Math.round(n)
		})
		.filter((n) => Number.isFinite(n))
	if (!numbers.length) return null
	if (numbers.length === 1) return { min: numbers[0], max: numbers[0] }
	const min = Math.min(numbers[0], numbers[1])
	const max = Math.max(numbers[0], numbers[1])
	return { min, max }
}

export const extractMaxExperienceYears = (text) => {
	const s = String(text || '')
	const matches = [...s.matchAll(/(\d{1,2})\s*\+?\s*(?:ans|ann[eé]e?s?|years?)/gi)]
	if (!matches.length) return null
	let max = null
	for (const m of matches) {
		const n = Number.parseInt(m[1], 10)
		if (!Number.isFinite(n)) continue
		if (max === null || n > max) max = n
	}
	return max
}

export const normalizeSuggestionsPayload = (payload) => {
	if (!payload) {
		return {
			summary: '',
			strengths: [],
			detectedRole: '',
			detectedLanguage: '',
			recommendationsByCategory: {},
		}
	}

	const raw = typeof payload === 'string' ? { summary: payload } : payload
	let summary = raw?.summary || raw?.synthese || raw?.synthesis || raw?.resume || ''
	const detectedRole = raw?.detectedRole || raw?.role || raw?.jobTitle || ''
	const detectedLanguage = raw?.detectedLanguage || raw?.language || ''

	let strengths = toStringList(raw?.strengths || raw?.pointsForts || raw?.highlights || raw?.strongPoints)

	if (strengths.length === 0 && typeof summary === 'string' && /points\s+forts?/i.test(summary)) {
		const match = summary.match(
			/points\s+forts?\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:axes\s+d['’]am[ée]lioration|recommandations?|am[ée]liorations?)\b|$)/i
		)
		if (match?.[1]) {
			strengths = toStringList(match[1])
			summary = summary.replace(match[0], '').trim()
		}
	}

	const recommendationsByCategory = {}
	const categorized = raw?.recommendationsByCategory || raw?.recommendations || raw?.improvements || null
	if (categorized && typeof categorized === 'object' && !Array.isArray(categorized)) {
		for (const [categoryKey, items] of Object.entries(categorized)) {
			const list = Array.isArray(items) ? items : [items]
			recommendationsByCategory[categoryKey] = list
				.map((item) => (typeof item === 'string' ? { title: item } : item))
				.filter(Boolean)
		}
	} else {
		const flat = Array.isArray(raw?.suggestions) ? raw.suggestions : []
		for (const item of flat) {
			const normalizedItem = typeof item === 'string' ? { title: item } : item
			if (!normalizedItem) continue
			const text = `${normalizedItem.title || ''} ${normalizedItem.why || ''} ${normalizedItem.example || ''}`
			const category = normalizedItem.category || categoryFromText(text)
			if (!recommendationsByCategory[category]) recommendationsByCategory[category] = []
			recommendationsByCategory[category].push(normalizedItem)
		}
	}

	const orderedKeys = ['Formation', 'Compétences techniques (skills)', 'Compétences (soft skills)', 'Expérience', 'Projets & Portfolio', 'Structure & ATS', 'Langues', 'Autres']
	const ordered = {}
	for (const key of orderedKeys) {
		if (recommendationsByCategory[key]?.length) ordered[key] = recommendationsByCategory[key]
	}
	for (const [key, value] of Object.entries(recommendationsByCategory)) {
		if (!ordered[key] && Array.isArray(value) && value.length) ordered[key] = value
	}

	return {
		summary,
		strengths,
		detectedRole,
		detectedLanguage,
		recommendationsByCategory: ordered,
	}
}
