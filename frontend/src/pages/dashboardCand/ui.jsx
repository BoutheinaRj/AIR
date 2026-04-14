/* eslint-disable react/prop-types */
import React from 'react'

export const Badge = ({ children, variant = 'slate' }) => {
	const styles = {
		slate: 'border-slate-200 bg-slate-50 text-slate-700',
		cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800',
		blue: 'border-blue-200 bg-blue-50 text-blue-800',
		emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
		amber: 'border-amber-200 bg-amber-50 text-amber-900',
		violet: 'border-violet-200 bg-violet-50 text-violet-800',
	}
	return (
		<span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[variant] || styles.slate}`}>
			{children}
		</span>
	)
}

export const Tag = ({ children }) => (
	<span className='inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700'>
		{children}
	</span>
)
