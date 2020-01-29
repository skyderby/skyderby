import { cropPoints } from 'components/TrackShow/pointsFilter'

const points = {
  none: [],
  one: [
    {
      altitude: 3000,
      gpsTime: Date.parse('2019-02-20T08:01:00'),
      flTime: 60,
      distance: 0,
      hSpeed: 60,
      vSpeed: 30,
      latitude: 20.0,
      longitude: 15.0
    }
  ],
  many: [
    {
      altitude: 4000,
      gpsTime: Date.parse('2019-02-20T08:00:00'),
      flTime: 0,
      glideRatio: 2.0,
      hSpeed: 60,
      vSpeed: 30,
      latitude: 20.0,
      longitude: 15.0
    },
    {
      altitude: 3000,
      gpsTime: Date.parse('2019-02-20T08:01:00'),
      flTime: 60,
      glideRatio: 1.9,
      hSpeed: 80,
      vSpeed: 50,
      latitude: 25.0,
      longitude: 17.0
    },
    {
      altitude: 2000,
      gpsTime: Date.parse('2019-02-20T08:02:00'),
      flTime: 120,
      glideRatio: 2.0,
      hSpeed: 90,
      vSpeed: 60,
      latitude: 27.0,
      longitude: 19.0
    },
    {
      altitude: 1000,
      gpsTime: Date.parse('2019-02-20T08:03:00'),
      flTime: 180,
      glideRatio: 3.0,
      hSpeed: 40,
      vSpeed: 10,
      latitude: 28.0,
      longitude: 18.0
    }
  ]
}

describe('cropping points', () => {
  it('when empty points', () => {
    expect(cropPoints(points.none)).toEqual(points.none)
  })

  it('when only one point', () => {
    expect(cropPoints(points.one)).toEqual(points.one)
  })

  it('when no altitudes provided', () => {
    expect(cropPoints(points.many)).toEqual(points.many)
  })

  it('when no need to interpolate', () => {
    expect(cropPoints(points.many, 3000, 2000)).toEqual([
      {
        altitude: 3000,
        gpsTime: Date.parse('2019-02-20T08:01:00'),
        flTime: 60,
        glideRatio: 1.9,
        hSpeed: 80,
        vSpeed: 50,
        latitude: 25.0,
        longitude: 17.0
      },
      {
        altitude: 2000,
        gpsTime: Date.parse('2019-02-20T08:02:00'),
        flTime: 120,
        glideRatio: 2.0,
        hSpeed: 90,
        vSpeed: 60,
        latitude: 27.0,
        longitude: 19.0
      }
    ])
  })

  it('with start point interpolation', () => {
    expect(cropPoints(points.many, 3500, 2000)).toEqual([
      {
        altitude: 3500,
        gpsTime: Date.parse('2019-02-20T08:00:30'),
        flTime: 30,
        glideRatio: 1.95,
        hSpeed: 70,
        vSpeed: 40,
        latitude: 22.5,
        longitude: 16.0
      },
      {
        altitude: 3000,
        gpsTime: Date.parse('2019-02-20T08:01:00'),
        flTime: 60,
        glideRatio: 1.9,
        hSpeed: 80,
        vSpeed: 50,
        latitude: 25.0,
        longitude: 17.0
      },
      {
        altitude: 2000,
        gpsTime: Date.parse('2019-02-20T08:02:00'),
        flTime: 120,
        glideRatio: 2.0,
        hSpeed: 90,
        vSpeed: 60,
        latitude: 27.0,
        longitude: 19.0
      }
    ])
  }),
    it('with end point interpolation', () => {
      expect(cropPoints(points.many, 3000, 1500)).toEqual([
        {
          altitude: 3000,
          gpsTime: Date.parse('2019-02-20T08:01:00'),
          flTime: 60,
          glideRatio: 1.9,
          hSpeed: 80,
          vSpeed: 50,
          latitude: 25.0,
          longitude: 17.0
        },
        {
          altitude: 2000,
          gpsTime: Date.parse('2019-02-20T08:02:00'),
          flTime: 120,
          glideRatio: 2.0,
          hSpeed: 90,
          vSpeed: 60,
          latitude: 27.0,
          longitude: 19.0
        },
        {
          altitude: 1500,
          gpsTime: Date.parse('2019-02-20T08:02:30'),
          flTime: 150,
          glideRatio: 2.5,
          hSpeed: 65,
          vSpeed: 35,
          latitude: 27.5,
          longitude: 18.5
        }
      ])
    })
})
