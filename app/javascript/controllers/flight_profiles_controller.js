import { Controller } from 'stimulus'
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import I18n from 'i18n'

const headerFormat = `
  <span style="font-size: 14px">{series.name}</span><br/>
`

const msToKmh = value => value * 3.6

const calculateDistance = (first, second) => {
  const firstPosition = new LatLon(first.latitude, first.longitude)
  const secondPosition = new LatLon(second.latitude, second.longitude)

  return firstPosition.distanceTo(secondPosition)
}

const getTerrainElevation = (measurements, distance) => {
  for (let idx = 0; idx < measurements.length - 1; idx++) {
    const prevRecord = measurements[idx]
    const nextRecord = measurements[idx + 1]

    if (!prevRecord || !nextRecord) continue

    const { distance: prevDistance, altitude: prevAltitude } = prevRecord
    const { distance: nextDistance, altitude: nextAltitude } = nextRecord

    if (prevDistance <= distance && nextDistance >= distance) {
      const altitudeDiff = nextAltitude - prevAltitude
      const coeff = (distance - prevDistance) / (nextDistance - prevDistance)

      return prevAltitude + altitudeDiff * coeff
    }
  }

  return null
}

const distanceToTerrainValue = value => {
  if (value < 1) return '<1'
  if (value > 120) return '>120'

  return Math.round(value)
}

const distanceToTerrainY = y => Math.max(1, Math.min(y, 120))

const calculateFlightProfile = (points, straightLine) => {
  const firstPoint = points[0]
  if (!firstPoint) return []

  let accumulatedDistance = 0

  return points.map((point, idx) => {
    const prevPoint = points[idx - 1] ?? firstPoint
    const distance = straightLine
      ? calculateDistance(point, firstPoint)
      : accumulatedDistance + calculateDistance(prevPoint, point)

    accumulatedDistance = distance

    return {
      x: distance,
      y: Math.round(Math.max(0, firstPoint.altitude - point.altitude)),
      custom: {
        fullSpeed: Math.round(msToKmh(point.fullSpeed)),
        hSpeed: Math.round(msToKmh(point.hSpeed)),
        vSpeed: Math.round(msToKmh(point.vSpeed))
      }
    }
  })
}

const calculateTerrainClearance = (points, measurements, straightLine) => {
  const flightProfile = calculateFlightProfile(points, straightLine)

  return flightProfile.map(({ x: distance, y: altitude }) => {
    const terrainElevation = getTerrainElevation(measurements, distance)

    if (terrainElevation === null) {
      return {
        x: distance,
        y: 120,
        custom: {
          presentation: '>120'
        }
      }
    }

    const distanceToTerrain = terrainElevation - altitude

    return {
      x: distance,
      y: distanceToTerrainY(distanceToTerrain),
      custom: {
        presentation: distanceToTerrainValue(distanceToTerrain)
      }
    }
  })
}

export default class FlightProfilesController extends Controller {
  static targets = [
    'tracksList',
    'flightProfilesChart',
    'terrainClearanceChart',
    'tagbar',
    'tagTemplate'
  ]

  connect() {
    this.selectedTracks = new Set(this.getSelectedTracksFromUrl())
    this.straightLine = this.getUnrollFromUrl()
    this.pointsCache = new Map()
    this.tracksCache = new Map()
    this.initFlightProfilesChart()
    this.initTerrainClearanceChart()

    this.resizeCharts = this.resizeCharts.bind(this)

    Array.from(this.selectedTracks)
      .reduce(
        (promise, trackId) => promise.then(this.displayTrack(trackId)),
        Promise.resolve()
      )
      .then(() => {
        const jumpLineId = this.getJumpLineIdFromUrl()
        if (jumpLineId) this.displayTerrainProfile(jumpLineId)
      })

    this.resizeCharts()
    window.addEventListener('resize', this.resizeCharts, { passive: true })
  }

  disconnect() {
    window.removeEventListener('resize', this.resizeHandler)
  }

  handleJumpLineSelection(event) {
    const jumpLineId = event.target.value
    const url = new URL(window.location.href)

    if (jumpLineId) {
      url.searchParams.set('jump_profile_id', jumpLineId)
      this.displayTerrainProfile(jumpLineId)
    } else {
      url.searchParams.delete('jump_profile_id')
      this.removeTerrainProfile()
    }

    window.history.replaceState({}, '', url)
  }

  handleTrackClick(event) {
    event.preventDefault()
    const trackElement = event.target.closest('a')
    const trackId = trackElement.dataset.id

    if (this.selectedTracks.has(trackId)) {
      this.removeTrack(trackId)
    } else {
      this.selectedTracks.add(trackId)
      trackElement.classList.add('active')
      this.displayTrack(trackId)
    }

    this.updateUrlWithSelectedTracks()
  }

  processTrackLinks(event) {
    for (let trackElement of event.target.children) {
      trackElement.dataset.turboPrefetch = false

      const trackId = trackElement.dataset.id
      if (this.selectedTracks.has(trackId)) {
        trackElement.classList.add('active')
      }
    }
  }

  getSelectedTracksFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.getAll('track[]')
  }

  getJumpLineIdFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.get('jump_profile_id')
  }

  getUnrollFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.get('unroll') === 'true'
  }

  updateUrlWithSelectedTracks() {
    const url = new URL(window.location.href)
    url.searchParams.delete('track[]')

    this.selectedTracks.forEach(trackId => {
      url.searchParams.append('track[]', trackId)
    })

    window.history.replaceState({}, '', url)
  }

  resizeCharts() {
    const charts = [this.flightProfilesChartTarget, this.terrainClearanceChartTarget]
    charts.forEach(chartElement => {
      const parent = chartElement.parentElement
      const parentBoundingRect = parent.getBoundingClientRect()
      if (!parentBoundingRect) return

      chartElement.chart.setSize(
        parentBoundingRect.width,
        parentBoundingRect.height,
        false
      )
    })
  }

  async displayTrack(trackId) {
    const pointFormatter = function () {
      return `
        <div>${this.series.options.custom?.place}</div>
        <div>${this.series.options.custom?.suit}</div>
        <span style="color: transparent">-</span><br/>
        <span style="font-size: 16px">↓${Math.round(this.y ?? 0)}
          ${I18n.t('units.m')} →${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
        <span style="color: transparent">-</span><br/>
        <div><b>Full speed:</b> ${this.options.custom?.fullSpeed} ${I18n.t('units.kmh')}</div>
        <div><b>Ground speed:</b> ${this.options.custom?.hSpeed} ${I18n.t('units.kmh')}</div>
        <div><b>Vertical speed:</b> ${this.options.custom?.vSpeed} ${I18n.t('units.kmh')}</div>
      `
    }

    const track = await this.fetchTrack(trackId)
    const { points } = await this.fetchPoints(trackId)
    const data = calculateFlightProfile(points, this.straightLine)

    this.flightProfilesChartTarget.chart.addSeries({
      name: `#${trackId} ${track.name}`,
      id: `track-${trackId}`,
      type: 'spline',
      data,
      custom: {
        trackId,
        name: track.name,
        place: track.place,
        suit: track.suit
      },
      tooltip: {
        headerFormat,
        pointFormatter
      }
    })

    this.addTrackToTagbar(track)
    this.displayTerrainClearance(track, points)
  }

  addTrackToTagbar(track) {
    const tag = this.tagTemplateTarget.content
      .querySelector('.filter-tag')
      .cloneNode(true)
    const tagbar = this.tagbarTarget

    tag.dataset.id = track.id
    tag.querySelector('.filter-tag-type').innerText = `${track.name} - #${track.id}`
    tagbar.appendChild(tag)
  }

  removeTag(event) {
    const tag = event.target.closest('.filter-tag')
    const trackId = tag.dataset.id
    this.removeTrack(trackId)
  }

  removeTrack(trackId) {
    this.selectedTracks.delete(trackId)
    this.updateUrlWithSelectedTracks()
    this.removeTrackFromCharts(trackId)
    this.pointsCache.delete(trackId)
    this.tracksCache.delete(trackId)

    this.tracksListTarget
      .querySelector(`[data-id="${trackId}"]`)
      ?.classList.remove('active')
    this.tagbarTarget.querySelector(`[data-id="${trackId}"]`)?.remove()
  }

  removeTrackFromCharts(trackId) {
    this.flightProfilesChartTarget.chart.get(`track-${trackId}`)?.remove()
  }

  fetchTrack(trackId) {
    if (this.tracksCache.has(trackId)) {
      return this.tracksCache.get(trackId)
    }

    return fetch(`/tracks/${trackId}`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(data => {
        this.tracksCache.set(trackId, data)
        return data
      })
  }

  fetchPoints(trackId) {
    if (this.pointsCache.has(trackId)) {
      return this.pointsCache.get(trackId)
    }

    return fetch(`/tracks/${trackId}/points`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(data => {
        this.pointsCache.set(trackId, data)
        return data
      })
  }

  displayTerrainClearance(track, points) {
    const pointFormatter = function () {
      return `
        <span style="margin-top: 10px"><b>${I18n.t('flight_profiles.distance_traveled')}:</b>
          ${Math.round(this.x)} ${I18n.t('units.m')}</span><br/>
        <span><b>${I18n.t('flight_profiles.distance_to_terrain')}:</b>
          ${this.options.custom?.presentation} ${I18n.t('units.m')}</span><br/>
      `
    }

    if (!this.currentMeasurements) return
    const terrainClearance = calculateTerrainClearance(
      points,
      this.currentMeasurements,
      this.straightLine
    )

    this.terrainClearanceChartTarget.chart.addSeries({
      name: `#${track.id} ${track.name}`,
      id: `track-${track.id}`,
      type: 'spline',
      data: terrainClearance,
      tooltip: {
        headerFormat,
        pointFormatter
      }
    })
  }

  displayTerrainProfile(jumpLineId) {
    const pointFormatter = function () {
      return `
        <span style="font-size: 16px">↓${this.y} ${I18n.t('units.m')}
          →${this.x} ${I18n.t('units.m')}
        </span><br/>`
    }

    fetch(`/exit_measurements/${jumpLineId}`, { Headers: { Accept: 'application/json' } })
      .then(response => response.json())
      .then(responseData => {
        const { name, measurements } = responseData
        this.currentMeasurements = measurements
        this.removeTerrainProfile()

        const maxAltitude = measurements.at(-1)?.altitude || 0
        const data = measurements.map(el => [el.distance, el.altitude, maxAltitude])

        this.flightProfilesChartTarget.chart.addSeries({
          name,
          id: 'placeMeasurementsLine',
          type: 'spline',
          color: '#B88E8D',
          data,
          tooltip: {
            headerFormat,
            pointFormatter
          }
        })

        this.flightProfilesChartTarget.chart.addSeries({
          id: 'placeMeasurementsArea',
          type: 'areasplinerange',
          color: '#B88E8D',
          data,
          enableMouseTracking: false,
          showInLegend: false
        })

        this.updateTerrainClearanceChart()
      })
  }

  removeTerrainProfile() {
    this.terrainClearanceChartTarget.chart.get('placeMeasurementsLine')?.remove()
    this.terrainClearanceChartTarget.chart.get('placeMeasurementsArea')?.remove()
  }

  updateTerrainClearanceChart() {}

  onZoomChange(extremes) {
    if (!extremes) {
      this.terrainClearanceChartTarget.chart.xAxis[0].setExtremes(null, null)
    } else {
      const { min, max } = extremes
      this.terrainClearanceChartTarget.chart.xAxis[0].setExtremes(min, max)
    }
  }

  initFlightProfilesChart() {
    this.flightProfilesChartTarget.chart = Highcharts.chart(
      this.flightProfilesChartTarget,
      this.flightProfilesChartOptions()
    )
  }

  initTerrainClearanceChart() {
    this.terrainClearanceChartTarget.chart = Highcharts.chart(
      this.terrainClearanceChartTarget,
      this.terrainClearanceChartOptions()
    )
  }

  flightProfilesChartOptions() {
    return {
      chart: {
        type: 'spline',
        zoomType: 'x',
        events: {
          selection: event => {
            if (event.xAxis?.[0]) {
              const { min, max } = event.xAxis[0]
              this.onZoomChange({ min, max })
            } else {
              this.onZoomChange(null)
            }

            return undefined
          }
        }
      },
      title: {
        text: null
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        series: {
          marker: {
            radius: 1
          },
          fillOpacity: 0.7,
          states: {
            inactive: {
              enabled: false
            }
          }
        }
      },
      tooltip: {
        useHTML: true
      },
      xAxis: {
        crosshair: true,
        opposite: true,
        gridLineWidth: 1,
        tickInterval: 100,
        min: 0,
        events: {
          setExtremes: function (event) {
            this.chart?.yAxis?.[0]?.setExtremes(event.min, event.max, true)
          }
        }
      },
      yAxis: {
        title: {
          text: 'Flight profiles'
        },
        reversed: true,
        tickInterval: 100,
        min: 0
      },
      series: [
        {
          type: 'spline',
          data: []
        }
      ],
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      }
    }
  }

  terrainClearanceChartOptions() {
    return {
      chart: {
        type: 'spline',
        height: '150px'
      },
      title: {
        text: null
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        series: {
          marker: {
            radius: 1
          },
          states: {
            inactive: {
              enabled: false
            }
          },
          zones: [
            {
              value: 0
            },
            {
              value: 5,
              color: 'red'
            }
          ]
        }
      },
      yAxis: {
        title: {
          text: 'Terrain clearance'
        },
        gridLineWidth: 1,
        tickInterval: 25,
        min: 0,
        max: 125,
        plotBands: [
          {
            color: '#efcdcb',
            from: 0,
            to: 25
          },
          {
            color: '#e4f1de',
            from: 100,
            to: 125
          }
        ]
      },
      xAxis: {
        title: {
          text: null
        },
        crosshair: true,
        tickInterval: 100,
        tickLength: 0,
        gridLineWidth: 1,
        labels: {
          enabled: false
        }
      },
      series: [
        {
          type: 'spline',
          data: []
        }
      ],
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      }
    }
  }
}
