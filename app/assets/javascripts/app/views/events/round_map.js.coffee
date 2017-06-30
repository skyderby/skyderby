class Skyderby.views.RoundMapView extends Backbone.View

  lines_by_competitor: {}

  events:
    'change input': 'on_change_visibility'
    'click .round-competitors__group-row': 'toggle_group_visibility'
    'click .round-competitors__select-all': 'select_all'
    'click .round-competitors__unselect-all': 'unselect_all'

  initialize: (opts) ->
    @data = opts.competitors

    @listenToOnce(Skyderby, 'maps_api:ready', @on_maps_api_ready)
    Skyderby.helpers.init_maps_api()

  on_maps_api_ready: ->
    options =
      'zoom': 2,
      'mapTypeId': google.maps.MapTypeId.ROADMAP

    @map = new google.maps.Map(@$('#round-map')[0], options)
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

      hover_polyline = @draw_hover_polyline(
        competitor_data.path_coordinates,
        competitor_data.color,
        competitor_data.name)

      start_point = new google.maps.Marker
        position: competitor_data.start_point
        icon:
          path: google.maps.SymbolPath.CIRCLE
          strokeWeight: 5
          fillColor: '#ff1053'
          strokeColor: '#ff1053'
          fillOpacity: 1
        map: @map

      end_point = new google.maps.Marker
        position: competitor_data.end_point
        icon:
          path: google.maps.SymbolPath.CIRCLE
          strokeWeight: 5
          fillColor: '#5FAD41'
          strokeColor: '#5FAD41'
          fillOpacity: 1
        map: @map

      @lines_by_competitor['competitor_' + competitor_data.id] = [
        polyline,
        hover_polyline,
        start_point,
        end_point]

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

  draw_hover_polyline: (path, color, title) ->
    hover_polyline = new google.maps.Polyline
      path: path,
      strokeColor: color,
      strokeOpacity: 0.0001,
      strokeWeight: 15

    hover_polyline.setMap(@map)

    infowindow = new google.maps.InfoWindow()
    google.maps.event.addListener hover_polyline, 'mouseover', (e) ->
      infowindow.setContent("<span>#{title}</span>")
      infowindow.setPosition(e.latLng)
      infowindow.open(@map)

    google.maps.event.addListener hover_polyline, 'mousemove', (e) ->
      infowindow.setPosition(e.latLng)

    google.maps.event.addListener hover_polyline, 'mouseout', (e) ->
      infowindow.close()

    hover_polyline

  on_change_visibility: (e) ->
    el = $(e.currentTarget)
    map_property = if el.prop('checked') then @map else undefined
    current_graphics = @lines_by_competitor[el[0].id]
    for graphics in current_graphics
      graphics.setMap(map_property)

  toggle_group_visibility: (e) ->
    group_row = $(e.currentTarget)
    tbody = group_row.closest('tbody')

    has_unchecked = tbody.find('input:not(:checked)').length > 0
    new_state = if has_unchecked then true else false

    inputs = tbody.find('input')
    for checkbox in inputs
      $(checkbox).prop('checked', new_state).trigger('change')

  select_all: (e) ->
    e.currentTarget.blur()
    $('.round-competitors input').prop('checked', true).trigger('change')
    $('.round-competitors__group-row').data('selected', true)

  unselect_all: (e) ->
    e.currentTarget.blur()
    $('.round-competitors input').prop('checked', false ).trigger('change')
    $('.round-competitors__group-row').data('selected', false)
