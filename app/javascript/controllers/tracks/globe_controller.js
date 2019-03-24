import { Controller } from 'stimulus'
import { initCesiumApi } from 'utils/cesium_api'

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

    this.viewer.entities.add(this.mapEntity)

    this.zoom()

    this.drawNearbyPlaces()
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

  zoom() {
    this.viewer.zoomTo(
      this.viewer.entities.values[0],
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(this.mapsData.track_direction - 90),
        Cesium.Math.toRadians(-20),
        2500
      )
    )
  }

  drawNearbyPlaces() {
    const pin_builder = new Cesium.PinBuilder()
    const billboard_collection = this.viewer.scene.primitives.add(
      new Cesium.BillboardCollection({ scene : this.viewer.scene })
    )

    this.mapsData.nearby_places.forEach(place => {
      const position = Cesium.Cartesian3.fromDegrees(
        Number(place.longitude),
        Number(place.latitude)
      )

      billboard_collection.add({
        position : position,
        image : pin_builder.fromMakiIconId(
          'embassy',
          Cesium.Color.ROYALBLUE,
          24
        ),
        heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
      })

      this.viewer.entities.add({
        position: position,
        label: {
          text: place.name,
          font: '18px Helvetica',
          pixelOffset: new Cesium.Cartesian2(3, 9),
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
        }
      })
    })
  }

  get mapEntity() {
    return {
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({ start: this.startTime, stop: this.stopTime })
      ]),
      position: this.trajectory,
      orientation : new Cesium.VelocityOrientationProperty(this.trajectory),
      label: new Cesium.LabelGraphics({
        text: this.mapsData.name,
        scale: 0.7,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      }),
      ellipsoid: {
        radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
        material: Cesium.Color.RED
      },
      path: {
        resolution : 1,
        material : new Cesium.PolylineGlowMaterialProperty({
          glowPower : 0.1,
          color : Cesium.Color.YELLOW
        }),
        width : 10
      }
    }
  }

  get trajectory() {
    if (!this._trajectory) {
      this._trajectory = new Cesium.SampledPositionProperty()

      this.mapsData.points.forEach(point => {
        this._trajectory.addSample(
          point.gps_time,
          Cesium.Cartesian3.fromDegrees(
            Number(point.longitude),
            Number(point.latitude),
            Number(point.abs_altitude)
          )
        )
      })
    }

    return this._trajectory
  }

  get startTime() {
    const date = new Date(Date.parse(this.mapsData.start_time))
    return Cesium.JulianDate.fromDate(date)
  }

  get stopTime() {
    const date = new Date(Date.parse(this.mapsData.stop_time))
    return Cesium.JulianDate.fromDate(date)
  }

  get url() {
    return this.element.getAttribute('data-url')
  }
}
