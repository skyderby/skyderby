class Skyderby.views.TournamentMatchMap extends Backbone.View

  template:                   JST['app/templates/tournaments/matches/map'],
  competitor_legend_template: JST['app/templates/tournaments/matches/competitor_legend'],

  tagName: 'div',

  className: 'modal-dialog modal-lg',

  colors: [
    "#90ed7d", 
    "#7cb5ec",
    "#8085e9", 
    "#434348", 
    "#f7a35c", 
    "#f15c80", 
    "#e4d354", 
    "#8085e8", 
    "#8d4653", 
    "#91e8e1"
  ],

  # Model data and google maps script loading in two parallel asynchronous
  # calls, vars are used to trigger drawing trajectory when everything ready
  model_ready: false
  maps_ready:  false

  initialize: (opts) ->
    @modalView = new Skyderby.views.ModalView()

  render: ->
    @$el.html(@template(
      title: I18n.t('events.show.round_map_view')
    ))

    @modalView.$el.html(@$el)

    @listenTo(@modalView, 'modal:shown', @on_modal_shown)
    @listenTo(@modalView, 'modal:hidden', @on_modal_hidden)

    @listenToOnce(@model, 'sync', @on_model_ready)
    @listenToOnce(window.Skyderby, 'maps_api:ready', @on_maps_api_ready)

    @model.fetch()

    this

  open: ->
    @modalView.show()
    window.Skyderby.helpers.init_maps_api()
    this

  on_modal_shown: ->
    google.maps.event.trigger(@map, "resize");

  on_modal_hidden: ->
    @$el.remove();

  on_model_ready: ->
    @model_ready = true
    @render_map()

  on_maps_api_ready: ->
    @maps_ready = true

    options = 
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: google.maps.MapTypeId.SATELLITE

    @map = new google.maps.Map(@$('#match-map')[0], options)

    @render_map()

  render_map: ->
    return if (!@model_ready || !@maps_ready)

    lat_bounds = []
    lon_bounds = []

    color_index = 0
    for competitor_data in @model.get('competitors')
      @draw_trajectory(competitor_data.track_points, color_index)
      @add_competitor_to_legend(competitor_data.name, color_index)
      color_index += 1
      lats = _.pluck(competitor_data.track_points, 'latitude').sort()
      lons = _.pluck(competitor_data.track_points, 'longitude').sort()

      lat_bounds.push(lats[0])
      lat_bounds.push(lats[lats.length - 1])

      lon_bounds.push(lons[0])
      lon_bounds.push(lons[lons.length - 1])

    @draw_finish_line(@model.get('finish_line'))
    @draw_center_line(@model.get('finish_line'), @model.get('exit_point'))

    lat_bounds.sort()
    lon_bounds.sort()

    bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[0]), 
      Number(lon_bounds[0])
    ))

    bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[lat_bounds.length - 1]),
      Number(lon_bounds[lon_bounds.length - 1])
    ))

    google.maps.event.trigger(@map, "resize")

    @map.fitBounds(bounds)
    @map.setCenter(bounds.getCenter())

    @$('.round-map-loading').hide()

  draw_trajectory: (points, color_index) ->
    path = []
    for point in points
      path.push(
        lat: Number(point.latitude)
        lng: Number(point.longitude)
      )

    color = @colors[color_index]
    polyline = new google.maps.Polyline
      path: path,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 3

    polyline.setMap(@map)
    
  draw_finish_line: (finish_line_coordinates) ->
    finish_line_path = []
    for point in finish_line_coordinates
      finish_line_path.push(
        lat: Number(point.latitude),
        lng: Number(point.longitude)
      )

    polyline = new google.maps.Polyline(
      path: finish_line_path,
      geodesic: true,
      strokeColor: '#E84855',
      strokeOpacity: 1.0,
      strokeWeight: 2
    )

    polyline.setMap(@map);

  draw_center_line: (finish_line_coordinates, exit_point) ->
    start_lat = Number(finish_line_coordinates[0].latitude)
    end_lat = Number(finish_line_coordinates[1].latitude)

    start_lon = Number(finish_line_coordinates[0].longitude)
    end_lon = Number(finish_line_coordinates[1].longitude)

    center_lat = start_lat + (end_lat - start_lat) / 2
    center_lon = start_lon + (end_lon - start_lon) / 2

    center_line_path = [
      {lat: center_lat, lng: center_lon},
      {lat: Number(exit_point.latitude), lng: Number(exit_point.longitude)}
    ]

    polyline = new google.maps.Polyline(
      path: center_line_path,
      geodesic: true,
      strokeColor: '#E84855',
      strokeOpacity: 1.0,
      strokeWeight: 2
    )

    polyline.setMap(@map);

  add_competitor_to_legend: (name, color_index) ->
    template = @competitor_legend_template(
      color: @colors[color_index],
      name: name
    )
    @$('#match-competitors-legend').append(template)
