class Skyderby.views.RoundMapView extends Backbone.View

  initialize: (opts) ->
    @data = opts.competitors

    @listenToOnce(Skyderby, 'maps_api:ready', @on_maps_api_ready)
    Skyderby.helpers.init_maps_api()

  on_maps_api_ready: ->
    options =
      'zoom': 2,
      'mapTypeId': google.maps.MapTypeId.ROADMAP

    @map = new google.maps.Map(@$el[0], options)
    @draw_round_map()

    google.maps.event.addListenerOnce(@map, 'idle', =>
      @resize()
    )

  draw_round_map: ->
    lat_bounds = []
    lon_bounds = []

    for competitor_data in @data

      polyline = new google.maps.Polyline
        path: competitor_data.path_coordinates,
        strokeColor: competitor_data.color,
        strokeOpacity: 1, 
        strokeWeight: 3

      polyline.setMap(@map)

      new google.maps.Marker
        position: competitor_data.start_point
        icon:
          path: google.maps.SymbolPath.CIRCLE
          strokeWeight: 5
          fillColor: '#ff1053'
          strokeColor: '#ff1053'
          fillOpacity: 1
        map: @map

      new google.maps.Marker
        position: competitor_data.end_point
        icon:
          path: google.maps.SymbolPath.CIRCLE
          strokeWeight: 5
          fillColor: '#5FAD41'
          strokeColor: '#5FAD41'
          fillOpacity: 1
        map: @map

      lat_bounds.push(competitor_data.start_point.lat)
      lat_bounds.push(competitor_data.end_point.lat)

      lon_bounds.push(competitor_data.start_point.lng)
      lon_bounds.push(competitor_data.end_point.lng)

    lat_bounds.sort()
    lon_bounds.sort()

    @bounds = new google.maps.LatLngBounds()
    @bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[0]), 
      Number(lon_bounds[0])
    ))

    @bounds.extend(new google.maps.LatLng(
      Number(lat_bounds[lat_bounds.length - 1]),
      Number(lon_bounds[lon_bounds.length - 1])
    ))

    @resize()

    @$('.round-map-loading').hide()

  resize: ->
    return unless @map
    return unless @bounds

    google.maps.event.trigger(@map, "resize")
    @map.fitBounds(@bounds)
    @map.setCenter(@bounds.getCenter())
