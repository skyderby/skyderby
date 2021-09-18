export const haveIntersection = (
  first: HTMLDivElement | undefined | null,
  second: HTMLDivElement | undefined | null
): boolean => {
  if (!first || !second) return false

  const firstRect = first.getBoundingClientRect()
  const secondRect = second.getBoundingClientRect()

  const firstRight = firstRect.x + firstRect.width
  const secondRight = secondRect.x + secondRect.width

  return (
    (firstRect.x <= secondRect.x && firstRight >= secondRect.x) ||
    (secondRect.x <= firstRect.x && secondRight >= firstRect.x)
  )
}

export const calculateTicks = (domain: readonly number[], step = 100): number[] => {
  const min = Math.min(...domain) || 0
  const max = Math.max(...domain) || 0

  const intermediateTicks = Array(Math.floor((max - min) / step))
    .fill(undefined)
    .map((_, idx) => min + step * (idx + 1))
    .map(tick => Math.round(tick / 100) * 100)

  return Array.from(new Set([min, ...intermediateTicks, max]))
}
