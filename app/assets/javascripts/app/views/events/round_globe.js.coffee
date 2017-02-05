class Skyderby.views.RoundGlobeView extends Backbone.View
  # google maps script loading asynchronous
  maps_ready:  false

  events:
    'click .fast-forward-competitor': 'fast_forward_to_competitor'

  initialize: (opts) ->
    @map_data = opts.maps_data

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
    @viewer = new Cesium.Viewer(@$('#round-map')[0],
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

    for competitor_data in @map_data.competitors
      @draw_trajectory(competitor_data)

    start_time = Cesium.JulianDate.fromDate(new Date(@map_data.start_time))
    stop_time = Cesium.JulianDate.fromDate(new Date(@map_data.stop_time))
    @setup_viewer_clock start_time, stop_time

    @viewer.zoomTo(@viewer.entities[0])
    @draw_boundaries()

    @viewer.zoomTo(@viewer.entities);
    @$('#track-map-loading').remove()

  draw_trajectory: (competitor_data) ->
    property = @get_position_property(competitor_data.points)

    [first_point, ..., last_point] = competitor_data.points
    start_time = Cesium.JulianDate.fromDate(new Date(first_point.gps_time))
    stop_time = Cesium.JulianDate.fromDate(new Date(last_point.gps_time))

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
        leadTime: 0,
        trailTime: 120,
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

  draw_boundaries: ->
    ground_offset = Number(@map_data.boundaries_position.ground_offset)
    @draw_ellipse(@map_data.range_from + ground_offset, Cesium.Color.GREEN.withAlpha(0.0))
    @draw_ellipse(@map_data.range_to + ground_offset, Cesium.Color.YELLOW.withAlpha(0.0))
    
  draw_ellipse: (height, color) ->
    latitude = @map_data.boundaries_position.latitude
    longitude = @map_data.boundaries_position.longitude

    @viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      ellipse : {
        semiMinorAxis : 5000.0,
        semiMajorAxis : 5000.0,
        height: height,
        material : color
      }
    });

  fast_forward_to_competitor: (e) ->
    e.preventDefault()
    time = new Date($(e.currentTarget).data('start-time'))

    start = Cesium.JulianDate.fromDate(time)
    @viewer.clock.currentTime = start
