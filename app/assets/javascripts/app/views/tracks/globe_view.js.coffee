class Skyderby.views.TrackGlobeView extends Backbone.View
  model_ready: false,
  maps_ready: false,

  initialize: ->
    @listenToOnce(Skyderby, 'cesium_api:ready', @on_maps_api_ready)
    @listenToOnce(Skyderby, 'cesium_api:failed', @on_maps_api_failed)
    @listenToOnce(@model, 'sync', @on_model_ready)

    @model.fetch()

  render: ->
    Skyderby.helpers.init_cesium_api()

  on_model_ready: ->
    @model_ready = true
    @$('#track-map-loading-data i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-check')
    @draw_entities()

  on_maps_api_failed: ->
    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-exclamation-triangle')

  on_maps_api_ready: ->
    @maps_ready = true

    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-check')

    @setup_viewer()
    @draw_entities()

  setup_viewer: ->
    @viewer = new Cesium.Viewer(@$('#cesium-container')[0],
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

  get_position_property: ->
    property = new Cesium.SampledPositionProperty()

    for point in @model.get('points')
      position = Cesium.Cartesian3.fromDegrees(
        point.longitude, 
        point.latitude,
        point.abs_altitude)
      property.addSample(point.gps_time, position)
    property

  zoom: ->
    @viewer.zoomTo(
      @viewer.entities.values[0],
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(@model.get('track_direction') - 90),
        Cesium.Math.toRadians(-20),
        2500
      )
    )

  draw_entities: ->
  
    return if !@model_ready || !@maps_ready

    start_time = Cesium.JulianDate.fromDate(new Date(@model.get('start_time')))
    stop_time = Cesium.JulianDate.fromDate(new Date(@model.get('stop_time')))
    @setup_viewer_clock start_time, stop_time

    property = @get_position_property()

    entity = @viewer.entities.add({

      # Set the entity availability to the same interval as the simulation time.
      availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start : start_time
        stop : stop_time
      })]),

      # Use our computed positions
      position : property,

      # Automatically compute orientation based on position movement.
      orientation : new Cesium.VelocityOrientationProperty(property),

      ellipsoid : {
        radii : new Cesium.Cartesian3(10.0, 10.0, 10.0),
        material : Cesium.Color.RED
      }
      # Show the path as a pink line sampled in 1 second increments.
      path : {
        resolution : 1,
        material : new Cesium.PolylineGlowMaterialProperty({
          glowPower : 0.1,
          color : Cesium.Color.YELLOW
        }),
        width : 10
      }
    })
    
    @draw_nearby_places()

    @zoom()
    @$('#track-map-loading').fadeOut(500)

  draw_nearby_places: ->
    pin_builder = new Cesium.PinBuilder()
    billboard_collection = @viewer.scene.primitives.add(new Cesium.BillboardCollection({
      scene : @viewer.scene
    }))

    for place in @model.get('nearby_places')
      position = Cesium.Cartesian3.fromDegrees(place.longitude, place.latitude)
      billboard_collection.add({
        position : position,
        image : pin_builder.fromMakiIconId('embassy', Cesium.Color.ROYALBLUE, 24),
        heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
      })

      @viewer.entities.add({
        position: position,
        label:
          text: place.name,
          font: '18px Helvetica',
          pixelOffset: new Cesium.Cartesian2(3, 9),
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
      });
