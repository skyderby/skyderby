import { test, describe, expect } from 'vitest'
import { parseTerrainCsv } from './terrainProfiles'

describe('parseTerrainCsv', () => {
  test('rebases altitudes on the first row and keeps the last two columns', () => {
    const csv = [
      'Source: dtm',
      'X;Y;Z;M',
      '142448.81;6957045.37;1415.265991211;0',
      '142447.81;6957045.39;1408.545776367;6.794209854685274',
      '142446.81;6957045.41;1399.416625977;15.977966539358354'
    ].join('\n')

    expect(parseTerrainCsv(csv)).toEqual([
      { altitude: 0, distance: 0 },
      { altitude: 7, distance: 7 },
      { altitude: 16, distance: 16 }
    ])
  })

  test('ignores delimiters that only appear outside the data rows', () => {
    const csv = ['Source: dtm; EPSG:25833', 'X,Y,Z,M', '1000,0', '990,40'].join('\n')

    expect(parseTerrainCsv(csv)).toEqual([
      { altitude: 0, distance: 0 },
      { altitude: 10, distance: 40 }
    ])
  })

  test('sorts measurements by distance', () => {
    const csv = ['1000;20', '1010;0', '990;40'].join('\n')

    expect(parseTerrainCsv(csv)).toEqual([
      { altitude: -10, distance: 0 },
      { altitude: 0, distance: 20 },
      { altitude: 10, distance: 40 }
    ])
  })

  test('returns nothing when there are no numeric rows', () => {
    expect(parseTerrainCsv('name;value\nexit;top')).toEqual([])
    expect(parseTerrainCsv('')).toEqual([])
  })
})
