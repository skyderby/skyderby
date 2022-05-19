import {
  sumVectors,
  getMagnitude,
  getDirection,
  vectorFromMagnitudeAndDirection
} from 'utils/vectors'

describe('utils/vestors', () => {
  it('sumVectors', () => {
    const result = sumVectors([1, 1], [2, 2])

    expect(result).toEqual([3, 3])
  })

  it('getMagnitude', () => {
    const magnitude = getMagnitude([1.36, 1.46])

    expect(Math.round(magnitude * 100) / 100).toEqual(2.0)
  })

  it('getDirection', () => {
    const direction = getDirection([1.36, 1.46])

    expect(Math.round(direction)).toEqual(47)
  })

  it('vectorFromMagnitudeAndDirection', () => {
    const [x, y] = vectorFromMagnitudeAndDirection(2, 47)

    expect(Math.round(x * 100) / 100).toEqual(1.36)
    expect(Math.round(y * 100) / 100).toEqual(1.46)
  })
})
