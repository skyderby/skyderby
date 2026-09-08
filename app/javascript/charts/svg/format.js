import { convertLength } from 'utils/units'

export const PRIMARY_COLOR = '#2196F3'
export const COMPARE_COLOR = '#9C27B0'

export const formatAxisLength = (meters, units) => {
  const value = convertLength(meters, units)
  if (units === 'imperial') {
    return value === 0 ? '0' : `${(value / 1000).toFixed(1)}k`
  }
  return String(Math.round(value))
}

export const deltaCellHtml = (a, b, digits = 0, cap = null) => {
  if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) return ''

  const diff = Number((a - b).toFixed(digits))
  const denom = Math.max(Math.abs(a), Math.abs(b)) || 1
  const width = Math.min(50, (Math.abs(diff) / denom) * 50)
  const primaryLeads = diff >= 0

  const radius = primaryLeads ? '2px 0 0 2px' : '0 2px 2px 0'
  const fillStyle = primaryLeads
    ? `right:50%;left:auto;width:${width}%;border-radius:${radius};background:${PRIMARY_COLOR}`
    : `left:50%;right:auto;width:${width}%;border-radius:${radius};background:${COMPARE_COLOR}`
  const valueClass = primaryLeads ? 'is-primary' : 'is-compare'

  let valueText
  if (cap != null && Math.abs(diff) > cap) {
    valueText = diff > 0 ? `≥${cap}` : `≤-${cap}`
  } else {
    valueText = `${diff > 0 ? '+' : ''}${diff.toFixed(digits)}`
  }

  return `<span class="side-tt-delta"><span class="side-tt-delta__bar"><span class="side-tt-delta__mark"></span><span class="side-tt-delta__fill" style="${fillStyle}"></span></span><span class="side-tt-delta__val ${valueClass}">${valueText}</span></span>`
}
