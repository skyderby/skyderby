import { cropPoints } from 'utils/pointsFilter'

const points = {
  none: [],
  one: [
    {
      absAltitude: 3000,
      altitude: 3000,
      gpsTime: new Date('2019-02-20T08:01:00'),
      flTime: 60,
      glideRatio: 2.0,
      distance: 0,
      hSpeed: 60,
      vSpeed: 30,
      latitude: 20.0,
      longitude: 15.0,
      verticalAccuracy: 1.25
    }
  ],
  many: [
    {
      absAltitude: 4000,
      altitude: 4000,
      gpsTime: new Date('2019-02-20T08:00:00'),
      flTime: 0,
      glideRatio: 2.0,
      hSpeed: 60,
      vSpeed: 30,
      latitude: 20.0,
      longitude: 15.0,
      verticalAccuracy: 1.75
    },
    {
      absAltitude: 3000,
      altitude: 3000,
      gpsTime: new Date('2019-02-20T08:01:00'),
      flTime: 60,
      glideRatio: 1.9,
      hSpeed: 80,
      vSpeed: 50,
      latitude: 25.0,
      longitude: 17.0,
      verticalAccuracy: 1.25
    },
    {
      absAltitude: 2000,
      altitude: 2000,
      gpsTime: new Date('2019-02-20T08:02:00'),
      flTime: 120,
      glideRatio: 2.0,
      hSpeed: 90,
      vSpeed: 60,
      latitude: 27.0,
      longitude: 19.0,
      verticalAccuracy: 1.25
    },
    {
      absAltitude: 1000,
      altitude: 1000,
      gpsTime: new Date('2019-02-20T08:03:00'),
      flTime: 180,
      glideRatio: 3.0,
      hSpeed: 40,
      vSpeed: 10,
      latitude: 28.0,
      longitude: 18.0,
      verticalAccuracy: 1.25
    }
  ]
}

describe('cropping points', () => {
  it('when empty points', () => {
    expect(cropPoints(points.none, 3000, 2000)).toEqual(points.none)
  })

  it('when only one point', () => {
    expect(cropPoints(points.one, 3000, 2000)).toEqual(points.one)
  })

  it('when no need to interpolate', () => {
    expect(cropPoints(points.many, 3000, 2000)).toEqual([
      {
        absAltitude: 3000,
        altitude: 3000,
        gpsTime: new Date('2019-02-20T08:01:00'),
        flTime: 60,
        glideRatio: 1.9,
        hSpeed: 80,
        vSpeed: 50,
        latitude: 25.0,
        longitude: 17.0,
        verticalAccuracy: 1.25
      },
      {
        absAltitude: 2000,
        altitude: 2000,
        gpsTime: new Date('2019-02-20T08:02:00'),
        flTime: 120,
        glideRatio: 2.0,
        hSpeed: 90,
        vSpeed: 60,
        latitude: 27.0,
        longitude: 19.0,
        verticalAccuracy: 1.25
      }
    ])
  })

  it('with start point interpolation', () => {
    expect(cropPoints(points.many, 3500, 2000)).toEqual([
      {
        absAltitude: 3500,
        altitude: 3500,
        gpsTime: new Date('2019-02-20T08:00:30'),
        flTime: 30,
        glideRatio: 1.95,
        hSpeed: 70,
        vSpeed: 40,
        latitude: 22.5,
        longitude: 16.0,
        verticalAccuracy: 1.5
      },
      {
        absAltitude: 3000,
        altitude: 3000,
        gpsTime: new Date('2019-02-20T08:01:00'),
        flTime: 60,
        glideRatio: 1.9,
        hSpeed: 80,
        vSpeed: 50,
        latitude: 25.0,
        longitude: 17.0,
        verticalAccuracy: 1.25
      },
      {
        absAltitude: 2000,
        altitude: 2000,
        gpsTime: new Date('2019-02-20T08:02:00'),
        flTime: 120,
        glideRatio: 2.0,
        hSpeed: 90,
        vSpeed: 60,
        latitude: 27.0,
        longitude: 19.0,
        verticalAccuracy: 1.25
      }
    ])
  })

  it('with end point interpolation', () => {
    expect(cropPoints(points.many, 3000, 1500)).toEqual([
      {
        absAltitude: 3000,
        altitude: 3000,
        gpsTime: new Date('2019-02-20T08:01:00'),
        flTime: 60,
        glideRatio: 1.9,
        hSpeed: 80,
        vSpeed: 50,
        latitude: 25.0,
        longitude: 17.0,
        verticalAccuracy: 1.25
      },
      {
        absAltitude: 2000,
        altitude: 2000,
        gpsTime: new Date('2019-02-20T08:02:00'),
        flTime: 120,
        glideRatio: 2.0,
        hSpeed: 90,
        vSpeed: 60,
        latitude: 27.0,
        longitude: 19.0,
        verticalAccuracy: 1.25
      },
      {
        absAltitude: 1500,
        altitude: 1500,
        gpsTime: new Date('2019-02-20T08:02:30'),
        flTime: 150,
        glideRatio: 2.5,
        hSpeed: 65,
        vSpeed: 35,
        latitude: 27.5,
        longitude: 18.5,
        verticalAccuracy: 1.25
      }
    ])
  })
})
