/* eslint-disable react/prop-types */
import React from 'react'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export const LineAreaChart = ({ data, height = 140 }) => {
	const width = 560
	const padding = { top: 12, right: 12, bottom: 24, left: 36 }
	const points = Array.isArray(data) ? data : []
	const values = points.map((p) => (Number.isFinite(p?.value) ? p.value : 0))
	const maxVal = Math.max(1, ...values)
	const minVal = 0

	const innerW = width - padding.left - padding.right
	const innerH = height - padding.top - padding.bottom
	const stepX = points.length > 1 ? innerW / (points.length - 1) : innerW

	const xy = points.map((p, idx) => {
		const v = Number.isFinite(p?.value) ? p.value : 0
		const x = padding.left + idx * stepX
		const y = padding.top + (1 - (v - minVal) / (maxVal - minVal)) * innerH
		return { x, y, v, label: p?.label || '' }
	})

	const lineD = xy.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
	const areaD = `${lineD} L ${(padding.left + (points.length - 1) * stepX).toFixed(2)} ${(padding.top + innerH).toFixed(2)} L ${padding.left.toFixed(2)} ${(padding.top + innerH).toFixed(2)} Z`

	const ticks = 4
	const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
		const t = i / ticks
		const v = (1 - t) * maxVal
		const y = padding.top + t * innerH
		return { v: Math.round(v * 10) / 10, y }
	})

	return (
		<div className='w-full overflow-x-auto'>
			<svg viewBox={`0 0 ${width} ${height}`} className='w-full min-w-[520px]'>
				<defs>
					<linearGradient id='airLineFill' x1='0' y1='0' x2='0' y2='1'>
						<stop offset='0%' stopColor='#06d5e0' stopOpacity='0.25' />
						<stop offset='100%' stopColor='#06d5e0' stopOpacity='0.02' />
					</linearGradient>
				</defs>

				{yTicks.map((t) => (
					<g key={`y-${t.y}`}>
						<line x1={padding.left} y1={t.y} x2={width - padding.right} y2={t.y} stroke='#e2e8f0' strokeWidth='1' />
						<text x={padding.left - 8} y={t.y + 4} textAnchor='end' fontSize='10' fill='#64748b'>
							{t.v}
						</text>
					</g>
				))}

				<path d={areaD} fill='url(#airLineFill)' />
				<path d={lineD} fill='none' stroke='#06d5e0' strokeWidth='2.5' />
				{xy.map((p) => (
					<circle key={`pt-${p.x}`} cx={p.x} cy={p.y} r='2.8' fill='#001d3e' stroke='#06d5e0' strokeWidth='1.5' />
				))}

				{xy.length > 0 ? (
					<>
						<text x={padding.left} y={height - 8} fontSize='10' fill='#64748b'>
							{xy[0].label}
						</text>
						<text x={width - padding.right} y={height - 8} textAnchor='end' fontSize='10' fill='#64748b'>
							{xy[xy.length - 1].label}
						</text>
					</>
				) : null}
			</svg>
		</div>
	)
}

export const DonutChart = ({ segments, size = 160 }) => {
	const s = Array.isArray(segments) ? segments : []
	const total = Math.max(1, s.reduce((acc, seg) => acc + (Number.isFinite(seg?.value) ? seg.value : 0), 0))
	const cx = size / 2
	const cy = size / 2
	const r = size * 0.36
	const stroke = size * 0.12
	const C = 2 * Math.PI * r
	let offset = 0

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<circle cx={cx} cy={cy} r={r} fill='none' stroke='#e2e8f0' strokeWidth={stroke} />
			{s.map((seg) => {
				const val = Number.isFinite(seg?.value) ? seg.value : 0
				const frac = clamp(val / total, 0, 1)
				const len = frac * C
				const dash = `${len} ${C - len}`
				const dashOffset = -offset
				offset += len
				return (
					<circle
						key={`seg-${seg?.label || seg?.color || 'seg'}`}
						cx={cx}
						cy={cy}
						r={r}
						fill='none'
						stroke={seg.color}
						strokeWidth={stroke}
						strokeLinecap='round'
						strokeDasharray={dash}
						strokeDashoffset={dashOffset}
						transform={`rotate(-90 ${cx} ${cy})`}
					/>
				)
			})}
		</svg>
	)
}

export const BarChart = ({ values, labels, height = 160 }) => {
	const list = Array.isArray(values) ? values : []
	const max = Math.max(1, ...list.map((v) => (Number.isFinite(v) ? v : 0)))

	return (
		<div className='w-full overflow-x-auto'>
			<div className='flex min-w-[680px] items-end gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3' style={{ height }}>
				{list.map((v, i) => {
					const safe = Number.isFinite(v) ? v : 0
					const h = Math.max(4, Math.round((safe / max) * (height - 46)))
					return (
						<div key={`${labels?.[i] || i}`} className='flex w-6 flex-col items-center justify-end gap-1'>
							<div className='w-full rounded-t bg-gradient-to-t from-[#0a5f88] to-[#06d5e0]' style={{ height: `${h}px` }} title={`${labels?.[i] || i}: ${safe}`} />
							<span className='text-[10px] font-semibold text-slate-500'>{(labels?.[i] || '').slice(0, 2)}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
