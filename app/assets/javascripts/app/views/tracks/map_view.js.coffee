class Skyderby.views.TrackMapView extends Backbone.View

  settings_template: JST['app/templates/track_gmaps_settings_button']

  # Model data and google maps script loading in two parallel asynchronous
  # calls, vars are used to trigger drawing trajectory when everything ready
  model_ready: false
  maps_ready:  false

  show_zerowind_trajectory: true

  # Array stores polylines from zero-wind trajectory and
  # used to trigger show/hide zero-wind trajectory 
  zerowind_polylines: []

  events: 
    'click #toggle_zerowind_trajectory a': 'toggle_zerowind_trajectory',
    'click #set-weather-data': 'set_weather_data'

  initialize: ->
    @listenToOnce(window.Skyderby, 'maps_api:ready', @on_maps_api_ready)
    @listenToOnce(Skyderby, 'maps_api:failed', @on_maps_api_failed_load)
    @listenToOnce(@model, 'sync', @on_model_ready)

    @model.fetch()
    
  render: ->
    window.Skyderby.helpers.init_maps_api()

  on_model_ready: ->
    @model_ready = true
    @$('#track-map-loading-data i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-check');
    @draw_trajectory()
    @render_settings()

  on_maps_api_failed_load: ->
    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-exclamation-triangle');

  on_maps_api_ready: ->
    @maps_ready = true

    @$('#track-map-loading-api i')
      .removeClass(' fa-spin fa-circle-o-notch ')
      .addClass('fa-check');

    center = new google.maps.LatLng(26.703115, 22.085180)
    options =
      'zoom': 2,
      'center': center,
      'mapTypeId': 'terrain'

    @map = new google.maps.Map(@$('#track-map')[0], options)
    @map.addListener('click', @displayLocationElevation)

    @draw_trajectory()

  draw_trajectory: ->
    return if (!this.model_ready || !this.maps_ready)
      
    @draw_polyline(@model.get('points'))

    if @model.get('wind_cancellation')
      opts = {
        stroke_opacity: 0.4,
        stroke_weight: 7,
        polylines: @zerowind_polylines
      }
      @draw_polyline(@model.get('zerowind_points'), opts)
      @draw_polar_chart()

    @fit_bounds()

    @$('#track-map-loading').fadeOut(500);

  draw_polyline: (points, opts) ->
    path_coordinates = []
    prev_point = null
    stroke_opacity = 1
    stroke_weight = 6
    polylines = []

    opts = {} if !opts
    stroke_opacity = opts.stroke_opacity if _.has(opts, 'stroke_opacity')
    stroke_weight = opts.stroke_weight if _.has(opts, 'stroke_weight')
    polylines = opts.polylines if _.has(opts, 'polylines')

    for current_point in points
      speed_group_same = prev_point && @speed_group(prev_point.h_speed) == @speed_group(current_point.h_speed)

      if path_coordinates.length == 0 || speed_group_same

        path_coordinates.push
          'lat': Number(current_point.latitude)
          'lng': Number(current_point.longitude)

      else

        polylines.push(
          @create_polyline(path_coordinates, stroke_opacity, stroke_weight, prev_point.h_speed)
        )

        path_coordinates = []
        path_coordinates.push
          'lat': Number(prev_point.latitude)
          'lng': Number(prev_point.longitude)

      prev_point = current_point

    polylines.push(
      @create_polyline(path_coordinates, stroke_opacity, stroke_weight, prev_point.h_speed)
    )

  create_polyline: (path, stroke_opacity, stroke_weight, speed) ->
    polyline = new google.maps.Polyline
      path: path
      strokeColor: $('.hl' + @speed_group(speed)).css( "background-color" )
      strokeOpacity: stroke_opacity
      strokeWeight: stroke_weight
    polyline.setMap(@map)
    polyline

  fit_bounds: ->
    points = @model.get('points')

    if @model.get('wind_cancellation') && @show_zerowind_trajectory
      points = points.concat @model.get('zerowind_points')

    lats = _.pluck(points, 'latitude').sort()
    lons = _.pluck(points, 'longitude').sort()

    bounds = new google.maps.LatLngBounds()

    bounds.extend(new google.maps.LatLng(
      Number(lats[0]), 
      Number(lons[0])
    ))

    bounds.extend(new google.maps.LatLng(
      Number(lats[lats.length - 1]),
      Number(lons[lons.length - 1])
    ))

    @map.fitBounds(bounds)
    @map.setCenter(bounds.getCenter())

  set_visibility_zerowind_polyline: ->
    chart_container = @$('#track-map-polar-chart')
    if @show_zerowind_trajectory
      chart_container.show()
    else
      chart_container.hide()

    for polyline in @zerowind_polylines
      polyline.setMap(if @show_zerowind_trajectory then @map else null)
  
  draw_polar_chart: ->
    container = @$('#track-map-polar-chart')
    Skyderby.helpers.init_wind_polar_chart(container, @model.get_wind_data())

  render_settings: ->
    opts =
      wind_cancellation: @model.get('wind_cancellation')
      show_zerowind_trajectory: @show_zerowind_trajectory

    @$('.settings-button').html(@settings_template(opts))

  set_weather_data: (e) ->
    e.preventDefault()
    view = new Skyderby.views.WeatherDataForm
      parent_url: @model.track_url(),
      can_manage: @model.get('can_manage'),
      default_date: @model.get('default_weather_date')

    view.render().open()

  toggle_zerowind_trajectory: (e) ->
    e.preventDefault()
    @show_zerowind_trajectory = !@show_zerowind_trajectory
    @set_visibility_zerowind_polyline()
    @fit_bounds()

    button_text = 
      if @show_zerowind_trajectory
        'Hide zero-wind trajectory'
      else
        'Show zero-wind trajectory'

    @$('#toggle_zerowind_trajectory a').text(button_text)

  speed_group: (speed) ->
    if speed > 250
      return 6
    else if speed > 220
      return 5
    else if speed > 190
      return 4
    else if speed > 160
      return 3
    else if speed > 130
      return 2
    else
      return 1

  speed_group_color: (spd_group) ->
      if spd_group == 1
        return 'aa2e7e2d'
      else if spd_group == 2
        return 'aa43c042'
      else if spd_group == 3
        return 'aa34ced9'
      else if spd_group == 4
        return 'aa0f67e4'
      else if spd_group == 5
        return 'aa0c00e7'
      else if spd_group == 6
        return 'aa0c0060'

  displayLocationElevation: (event) ->
    location = event.latLng
    elevator = new google.maps.ElevationService()
    # Initiate the location request
    elevator.getElevationForLocations({
      'locations': [location]
    }, (results, status) ->
      if (status == google.maps.ElevationStatus.OK)
        # Retrieve the first result
        if results[0]
          console.log(
            'Latitude: ' + location.lat().toFixed(8) + ' - ' +
            'Longitude: ' + location.lng().toFixed(8) + ' - ' +
            'Elevation: ' + Math.round(results[0].elevation) + ' m.')
        else
          console.log('No results found')
      else
        console.log('Elevation service failed due to: ' + status)
    )
