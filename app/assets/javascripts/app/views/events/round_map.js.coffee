class Skyderby.views.RoundMapView extends Backbone.View

  template:                JST['app/templates/round_map_view/form']
  round_row_template:      JST['app/templates/round_map_view/round_row']
  competitor_row_template: JST['app/templates/round_map_view/competitor_row']

  tagName: 'div'

  className: 'modal-dialog modal-lg'

  # events:
  #   'click tr'                     : 'on_row_click',
  #   'change input[type="checkbox"]': 'on_toggle_checkbox'

  colors: [
    "#7cb5ec",
    "#434348", 
    "#90ed7d", 
    "#f7a35c", 
    "#8085e9", 
    "#f15c80", 
    "#e4d354", 
    "#8085e8", 
    "#8d4653", 
    "#91e8e1"
  ]

  competitors: {}

  initialize: (opts) ->
    @modalView = new Skyderby.views.ModalView()

  render: ->
    @$el.html(@template(
      title: I18n.t('events.show.round_map_view')
    ))

    @modalView.$el.html(@$el)

    @listenTo(@modalView, 'modal:hidden', @onModalHidden)

    @listenToOnce(window.Skyderby, 'maps_api:ready', @on_maps_api_ready)
    window.Skyderby.helpers.init_maps_api()

    this

  on_maps_api_ready: ->
    options =
      'zoom': 2,
      'mapTypeId': google.maps.MapTypeId.ROADMAP

    @map = new google.maps.Map(@$('#round-map')[0], options)

    @render_competitors()

  open: ->
    @modalView.show()
        
    $.get(@model.url() + '/map', @on_receive_map_data.bind(this))

    this

  onModalHidden: ->
    @$el.remove()

  render_competitors: ->
    competitors_by_sections = window.Competition.competitors.groupBy('section_id')

    for section_id, competitors of competitors_by_sections
      tbody = $('<tbody>')
      section_name = window.Competition.sections.get(section_id).get('name')

      tbody.append(@round_row_template(name: section_name))

      for competitor in competitors
        competitor_row = @competitor_row_template(
          id: competitor.id,
          name: competitor.get('profile').name
        )
        tbody.append(competitor_row)
      @$('.round-competitors').append(tbody)

  on_receive_map_data: (data) ->
    lat_bounds = []
    lon_bounds = []

    color_index = 0

    for competitor_id, competitor_data of data

      start_window = undefined
      end_window = undefined

      path_coordinates = []
      track_points = competitor_data.points
      for point, point_index in track_points
        path_coordinates.push(
          'lat': Number(point.latitude),
          'lng': Number(point.longitude)
        )

        if !start_window && point.altitude <= window.Competition.get('range_from')
          if point_index > 0
            prev_point = track_points[point_index - 1]
            start_window = Skyderby.helpers.pointInterpolation(
              point, 
              prev_point, 
              @interpolation_coeff(point, prev_point, window.Competition.get('range_from'))
            )
          else
            start_window = point

        if !end_window && point.altitude <= window.Competition.get('range_to')
          if (point_index > 0)
            prev_point = track_points[point_index - 1]
            end_window = Skyderby.helpers.pointInterpolation(
              point, 
              prev_point, 
              @interpolation_coeff(point, prev_point, window.Competition.get('range_to'))
            )
          else
            end_window = point

      current_color = @colors[color_index]
      polyline = new google.maps.Polyline
        path: path_coordinates,
        strokeColor: current_color,
        strokeOpacity: 1, 
        strokeWeight: 3

      polyline.setMap(@map)

      if (start_window)
        new google.maps.Marker
          position:
            lat: Number(start_window.latitude)
            lng: Number(start_window.longitude)
          icon:
            path: google.maps.SymbolPath.CIRCLE
            strokeWeight: 5
            fillColor: '#ff1053'
            strokeColor: '#ff1053'
            fillOpacity: 1
          map: @map

      if end_window
        new google.maps.Marker
          position:
            lat: Number(end_window.latitude)
            lng: Number(end_window.longitude)
          icon:
            path: google.maps.SymbolPath.CIRCLE
            strokeWeight: 5
            fillColor: '#5FAD41'
            strokeColor: '#5FAD41'
            fillOpacity: 1
          map: @map

      if start_window && end_window
        track_direction = Skyderby.helpers.trackDirection(start_window, end_window)
        @$('#track-direction-c' + competitor_id).text(Math.round(track_direction) + '°')

      lats = _.pluck(track_points, 'latitude').sort()
      lons = _.pluck(track_points, 'longitude').sort()

      lat_bounds.push(lats[0])
      lat_bounds.push(lats[lats.length - 1])

      lon_bounds.push(lons[0])
      lon_bounds.push(lons[lons.length - 1])

      cell = @$('#round-map-c' + competitor_id)
      cell.append($('<i>').addClass('fa fa-circle').css('color', current_color))
      cell.parent().removeClass('disabled')

      color_index += 1

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

  interpolation_coeff: (first, last, altitude) ->
    (first.altitude - altitude) / (first.altitude - last.altitude)
