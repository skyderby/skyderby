// Terrain profiles are measured relative to the exit, so the line always starts
// at the exit point even when it is not among the stored measurements.
export const withExitPoint = points => {
  const first = points[0]
  if (first && first.x === 0 && first.y === 0) return points

  return [{ x: 0, y: 0 }, ...points]
}

const DELIMITERS = [';', '\t', ',']

const toNumber = value => {
  const normalized = value.trim().replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null

  return Number(normalized)
}

const numericRows = (lines, delimiter) =>
  lines
    .map(line => line.split(delimiter))
    .filter(columns => columns.length >= 2)
    .map(columns => columns.slice(-2).map(toNumber))
    .filter(([elevation, distance]) => elevation !== null && distance !== null)

const parseWithBestDelimiter = lines =>
  DELIMITERS.map(delimiter => numericRows(lines, delimiter)).reduce(
    (best, rows) => (rows.length > best.length ? rows : best),
    []
  )

export const parseTerrainCsv = text => {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  const rows = parseWithBestDelimiter(lines)
  if (rows.length < 2) return []

  const [exitElevation] = rows[0]

  return rows
    .map(([elevation, distance]) => ({
      altitude: Math.round(exitElevation - elevation),
      distance: Math.round(distance)
    }))
    .sort((a, b) => a.distance - b.distance)
}
