class Skyderby.views.TournamentMatchMap extends Backbone.View
  # google maps script loading asynchronous
  maps_ready:  false

  render: ->
    $(document).one('maps_api:ready', @on_maps_api_ready.bind(this))
    Skyderby.helpers.init_maps_api()

  on_maps_api_ready: ->
    @maps_ready = true

    options =
      zoom: 2,
      center: new google.maps.LatLng(20, 20),
      mapTypeId: google.maps.MapTypeId.SATELLITE

    @map = new google.maps.Map(@el, options)

    @render_map()

  render_map: ->
    return unless @maps_ready

    lat_bounds = []
    lon_bounds = []

    for competitor_data in @model.get('competitors')
      @draw_trajectory(competitor_data)
      lats = _.pluck(competitor_data.path, 'lat').sort()
      lons = _.pluck(competitor_data.path, 'lng').sort()

      lat_bounds.push(lats[0])
      lat_bounds.push(lats[lats.length - 1])

      lon_bounds.push(lons[0])
      lon_bounds.push(lons[lons.length - 1])

    @draw_finish_line(@model.get('finish_line'))
    @draw_center_line(@model.get('finish_line'), @model.get('exit_point'))

    if lat_bounds.length > 0 && lon_bounds.length > 0
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

      @map.fitBounds(bounds)
      @map.setCenter(bounds.getCenter())

    google.maps.event.trigger(@map, "resize")
    @$('#track-map-loading').remove()

  draw_trajectory: (competitor_data) ->
    polyline = new google.maps.Polyline
      path: competitor_data.path,
      strokeColor: competitor_data.color,
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

    polyline.setMap(@map)

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

    polyline.setMap(@map)
