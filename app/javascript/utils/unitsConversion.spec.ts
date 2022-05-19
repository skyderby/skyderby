import { msToKmh, msToMph, metersToFeet, metersToMiles } from 'utils/unitsConversion'

describe('units conversion helpers', () => {
  it('m/s to km/h', () => {
    expect(msToKmh(5.5)).toEqual(19.8)
  })

  it('m/s to mi/h', () => {
    const result = msToMph(5)
    const rounded = Math.round(result * 1000) / 1000

    expect(rounded).toEqual(11.185)
  })

  it('meters to feet', () => {
    expect(metersToFeet(1000)).toEqual(3280.84)
  })

  it('meters to miles', () => {
    const result = metersToMiles(2000)
    const rounded = Math.round(result * 1000) / 1000

    expect(rounded).toEqual(1.243)
  })
})
