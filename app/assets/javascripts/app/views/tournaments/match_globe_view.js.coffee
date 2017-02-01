class Skyderby.views.TournamentMatchGlobe extends Backbone.View
  # google maps script loading asynchronous
  maps_ready:  false

  render: ->
    @listenToOnce(Skyderby, 'cesium_api:ready', @on_maps_api_ready)
    @listenToOnce(Skyderby, 'cesium_api:failed', @on_maps_api_failed)
    Skyderby.helpers.init_cesium_api()

  on_maps_api_ready: ->
    @maps_ready = true

    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-check')

    @setup_viewer()
    @render_map()

  on_maps_api_failed: ->
    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-exclamation-triangle')

  setup_viewer: ->
    @viewer = new Cesium.Viewer(@el,
      infoBox: false,
      homeButton: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
      selectionIndicator: false,
      scene3DOnly: true
    )

    terrainProvider = new Cesium.CesiumTerrainProvider(
      url : '//assets.agi.com/stk-terrain/world'
    )
    # @viewer.scene.globe.depthTestAgainstTerrain = true
    @viewer.terrainProvider = terrainProvider
    
  setup_viewer_clock: (start, stop) ->
    @viewer.clock.startTime = start.clone()
    @viewer.clock.stopTime = stop.clone()
    @viewer.clock.currentTime = start.clone()
    @viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
    @viewer.clock.shouldAnimate = false

    @viewer.timeline.zoomTo(start, stop)

  render_map: ->
    return unless @maps_ready

    for competitor_data in @model.get('competitors')
      @draw_trajectory(competitor_data)
      continue

    @draw_finish_line()
    @draw_center_line()

    @viewer.zoomTo(@viewer.entities)
    @$('#track-map-loading').remove()

  draw_trajectory: (competitor_data) ->
    property = @get_position_property(competitor_data.points)

    [first_point, ..., last_point] = competitor_data.points
    start_time = Cesium.JulianDate.fromDate(new Date(first_point.gps_time))
    stop_time = Cesium.JulianDate.fromDate(new Date(last_point.gps_time))

    @setup_viewer_clock start_time, stop_time

    @viewer.entities.add({

      # Set the entity availability to the same interval as the simulation time.
      availability : new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start : start_time
          stop : stop_time
        })
      ]),

      # Use our computed positions
      position : property,

      # Automatically compute orientation based on position movement.
      orientation : new Cesium.VelocityOrientationProperty(property),

      label: new Cesium.LabelGraphics(
        text: competitor_data.name,
        scale: 0.7,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      ),

      ellipsoid : {
        radii : new Cesium.Cartesian3(10.0, 10.0, 10.0),
        material: Cesium.Color.RED
      },

      path : {
        resolution : 1,
        material : new Cesium.PolylineGlowMaterialProperty({
          glowPower : 0.1,
          color: Cesium.Color.fromCssColorString(competitor_data.color)
        }),
        width : 10
      }
    })
    
  get_position_property: (points) ->
    property = new Cesium.SampledPositionProperty()

    for point in points
      position = Cesium.Cartesian3.fromDegrees(
        point.longitude,
        point.latitude,
        point.abs_altitude)
      property.addSample(point.gps_time, position)

    property

  draw_finish_line: () ->
    coordinates = @model.get('finish_line')
    min_heights = @model.get('finish_line_minimums')

    @viewer.entities.add({
      name: 'Finish line',
      wall: {
        positions : Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        material : Cesium.Color.BLUE.withAlpha(0.5),
        minimumHeights: min_heights
      }
    })

  draw_center_line: () ->
    coordinates = @model.get('center_line')
    min_heights = @model.get('center_line_minimums')

    @viewer.entities.add({
      name: 'Center line',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
        material: Cesium.Color.BLUE.withAlpha(0.3),
        minimumHeights: min_heights
      }
    })
