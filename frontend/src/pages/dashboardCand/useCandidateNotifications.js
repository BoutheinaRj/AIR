import { useCallback, useEffect, useState } from 'react'

export function useCandidateNotifications({ apiBase, candidateId, selectedView }) {
	const [notifications, setNotifications] = useState([])
	const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0)
	const [notificationsLoading, setNotificationsLoading] = useState(false)
	const [notificationsError, setNotificationsError] = useState('')

	const fetchNotifications = useCallback(async (forcedCandidateId) => {
		const targetCandidateId = forcedCandidateId || candidateId
		if (!targetCandidateId) return
		setNotificationsLoading(true)
		setNotificationsError('')
		try {
			const res = await fetch(`${apiBase}/notifications/candidate/${targetCandidateId}?limit=50`)
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data?.success) {
				throw new Error(data?.message || 'Impossible de charger les notifications.')
			}
			setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
			setNotificationsUnreadCount(Number(data.unreadCount) || 0)
		} catch (e) {
			setNotificationsError(String(e?.message || 'Erreur'))
			setNotifications([])
			setNotificationsUnreadCount(0)
		} finally {
			setNotificationsLoading(false)
		}
	}, [apiBase, candidateId])

	const markNotificationAsRead = useCallback(async (notificationId) => {
		if (!notificationId) return
		setNotificationsError('')
		try {
			const res = await fetch(`${apiBase}/notifications/${notificationId}/read`, { method: 'PATCH' })
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data?.success) {
				throw new Error(data?.message || 'Impossible de marquer comme lue.')
			}
			setNotifications((prev) => prev.map((n) => (n._id === notificationId ? data.notification : n)))
			setNotificationsUnreadCount((prev) => Math.max(0, prev - 1))
		} catch (e) {
			setNotificationsError(String(e?.message || 'Erreur'))
		}
	}, [apiBase])

	useEffect(() => {
		if (!candidateId) return
		fetchNotifications(candidateId)
	}, [candidateId, fetchNotifications])

	useEffect(() => {
		if (selectedView !== 'notifications') return
		if (!candidateId) return
		fetchNotifications(candidateId)
	}, [selectedView, candidateId, fetchNotifications])

	return {
		notifications,
		notificationsUnreadCount,
		notificationsLoading,
		notificationsError,
		fetchNotifications,
		markNotificationAsRead,
	}
}
