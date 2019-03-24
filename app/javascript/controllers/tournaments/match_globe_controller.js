import { Controller } from 'stimulus'
import { initCesiumApi } from 'utils/cesium_api'

class CompetitionEntryBuilder {
  constructor({ name, points, color }) {
    Object.assign(this, { name, points, color })
  }

  build() {
    return {
      availability: this.availability,
      position: this.position,
      orientation : new Cesium.VelocityOrientationProperty(this.position),
      label: this.label,
      ellipsoid: this.ellipsoid,
      path: this.path
    }
  }

  get availability() {
    return new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: this.startTime,
        stop: this.stopTime
      })
    ])
  }

  get position() {
    if (!this._position) {
      const position = new Cesium.SampledPositionProperty()

      this.points.forEach(({ gps_time, latitude, longitude, abs_altitude }) => {
        position.addSample(
          gps_time,
          Cesium.Cartesian3.fromDegrees(
            Number(longitude),
            Number(latitude),
            Number(abs_altitude)
          )
        )
      })

      this._position = position
    }

    return this._position
  }

  get label() {
    return new Cesium.LabelGraphics({
      text: this.name,
      scale: 0.7,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    })
  }

  get ellipsoid() {
    return {
      radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
      material: Cesium.Color.RED
    }
  }

  get path() {
    return {
      resolution: 1,
      leadTime: 0,
      trailTime: 120,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.fromCssColorString(this.color)
      }),
      width : 10
    }
  }

  get startTime() {
    const date = new Date(Date.parse(this.firstPoint.gps_time))
    return Cesium.JulianDate.fromDate(date)
  }

  get stopTime() {
    const date = new Date(Date.parse(this.lastPoint.gps_time))
    return Cesium.JulianDate.fromDate(date)
  }

  get firstPoint() {
    return this.points[0]
  }

  get lastPoint() {
    return this.points[this.points.length - 1]
  }
}

export default class extends Controller {
  static targets = [ 'dataStatus', 'cesiumStatus', 'loadingProgress', 'viewer' ]

  connect() {
    initCesiumApi()
    this.fetchData()
  }

  fetchData() {
    fetch(this.url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.mapsData = data
        this.setDataLoaded()
        this.renderMap()
      })
  }

  onCesiumReady() {
    this.cesiumLoaded = true
    this.cesiumStatusTarget.classList.remove('fa-spin', 'fa-circle-notch')
    this.cesiumStatusTarget.classList.add('fa-check')

    this.setupViewer()
    this.renderMap()
  }

  onCesiumFailed() {
    this.cesiumStatusTarget.classList.remove('fa', 'fa-spin', 'fa-circle-notch')
    this.cesiumStatusTarget.classList.add('fas', 'fa-exclamation-triangle')
  }

  setDataLoaded() {
    this.dataLoaded = true
    this.dataStatusTarget.classList.remove('fa-spin', 'fa-circle-notch')
    this.dataStatusTarget.classList.add('fa-check')
  }

  setupViewer() {
    this.viewer = new Cesium.Viewer(this.viewerTarget, {
      terrainProvider: Cesium.createWorldTerrain(),
      infoBox: false,
      homeButton: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
      selectionIndicator: false,
      scene3DOnly: true
    })
  }

  renderMap() {
    if (!this.dataLoaded || !this.cesiumLoaded) return

    this.loadingProgressTarget.style.display = 'none'

    this.setupClock()

    this.drawTrajectories()
    this.drawFinishLine()
    this.drawCenterLine()

    this.viewer.zoomTo(this.viewer.entities)
  }

  setupClock() {
    const clock = this.viewer.clock
    clock.startTime = this.startTime.clone()
    clock.stopTime = this.stopTime.clone()
    clock.currentTime = this.startTime.clone()
    clock.clockRange = Cesium.ClockRange.CLAMPED
    clock.shouldAnimate = false

    this.viewer.timeline.zoomTo(this.startTime, this.stopTime)
  }

  drawTrajectories() {
    this.mapsData.competitors.forEach(competitor => {
      const entity = new CompetitionEntryBuilder(competitor).build()
      this.viewer.entities.add(entity)
    })
  }

  drawFinishLine() {
    const coordinates = this.mapsData.finish_line
    const minHeights = this.mapsData.finish_line_minimums

    this.viewer.entities.add({
      name: 'Finish line',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        minimumHeights: minHeights
      }
    })
  }

  drawCenterLine() {
    const coordinates = this.mapsData.center_line
    const minHeights = this.mapsData.center_line_minimums

    this.viewer.entities.add({
      name: 'Center line',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        material: Cesium.Color.BLUE.withAlpha(0.3),
        minimumHeights: minHeights
      }
    })
  }

  get startTime() {
    const date = Math.min(
      ...this.mapsData.competitors.map(el =>
        Date.parse(el.points[0].gps_time)
      )
    )

    return Cesium.JulianDate.fromDate(new Date(date))
  }

  get stopTime() {
    const date = Math.max(
      ...this.mapsData.competitors.map(el =>
        Date.parse(el.points[el.points.length - 1].gps_time)
      )
    )

    return Cesium.JulianDate.fromDate(new Date(date))
  }

  get url() {
    return this.element.getAttribute('data-url')
  }
}
