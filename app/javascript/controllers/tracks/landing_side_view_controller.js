import { Controller } from '@hotwired/stimulus'
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty'
import SideProjectionChart from 'utils/tracks/SideProjectionChart'
import { fetchTrackPoints } from 'utils/tracks/trackData'
import { convertLength, lengthUnitLabel } from 'utils/units'

const SYNC_VERTICAL_SPEED = 10
const WINDOW_SECONDS = 30
const TOOLTIP_SECONDS = 10

export default class extends Controller {
  static targets = ['chart']
  static values = {
    pointsUrl: String,
    comparePointsUrl: String,
    units: { type: String, default: 'metric' }
  }

  connect() {
    this.connected = true

    const fetches = [fetchTrackPoints(this.pointsUrlValue, { convertSpeeds: true })]
    if (this.hasComparePointsUrlValue) {
      fetches.push(
        fetchTrackPoints(this.comparePointsUrlValue, { convertSpeeds: true }).catch(
          () => null
        )
      )
    }

    Promise.all(fetches)
      .then(([primary, compare]) => {
        if (!this.connected || !primary?.points?.length || !this.hasChartTarget) return

        this.chart = new SideProjectionChart(this.chartTarget, {
          units: this.unitsValue,
          syncVerticalSpeed: SYNC_VERTICAL_SPEED,
          persistentTooltip: true,
          persistentTooltipIndex: this.crossingAt(primary.points, TOOLTIP_SECONDS)?.index
        })

        this.chart.setFlightProfile(primary.points)
        this.markWindow(primary.points, (index, fraction, label) =>
          this.chart.setFinishLineCrossing(index, fraction, null, label)
        )

        if (compare?.points?.length) {
          this.chart.setCompareProfile(compare.points)
          this.markWindow(compare.points, (index, fraction, label) =>
            this.chart.setCompareFinishLineCrossing(index, fraction, null, label)
          )
        }

        this.chart.render()
      })
      .catch(() => {})
  }

  markWindow(points, apply) {
    const crossing = this.crossingAt(points, WINDOW_SECONDS)
    if (!crossing) return

    apply(crossing.index, crossing.fraction, this.distanceLabel(points, crossing))
  }

  distanceLabel(points, crossing) {
    const start = points[this.syncIndex(points)]
    const prev = points[crossing.index - 1]
    const curr = points[crossing.index]
    const lerp = (a, b) => a + (b - a) * crossing.fraction

    const distance = new LatLon(start.latitude, start.longitude).distanceTo(
      new LatLon(lerp(prev.latitude, curr.latitude), lerp(prev.longitude, curr.longitude))
    )

    return `${Math.round(convertLength(distance, this.unitsValue))} ${lengthUnitLabel(this.unitsValue)}`
  }

  syncIndex(points) {
    return points.findIndex(point => point.vSpeed >= SYNC_VERTICAL_SPEED)
  }

  crossingAt(points, seconds) {
    const syncIndex = this.syncIndex(points)
    if (syncIndex === -1) return null

    const targetFlTime = points[syncIndex].flTime + seconds

    for (let i = 1; i < points.length; i++) {
      if (points[i].flTime < targetFlTime) continue

      const prev = points[i - 1]
      const span = points[i].flTime - prev.flTime
      const fraction = span === 0 ? 0 : (targetFlTime - prev.flTime) / span

      return { index: i, fraction: Math.min(Math.max(fraction, 0), 1) }
    }

    return null
  }

  disconnect() {
    this.connected = false
    this.chart?.destroy()
    this.chart = null
  }
}
