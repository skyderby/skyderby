module Places
  module FinishLineHelper
    HOST = 'https://maps.googleapis.com/maps/api/staticmap?'.freeze

    def finish_line_static_map_path(finish_line)
      center = finish_line.center
      options = {
        size: '600x400',
        center: "#{center[:latitude]} #{center[:longitude]}",
        zoom: 15,
        maptype: 'satellite',
        path: finish_line_static_polyline(finish_line),
        key: maps_api_key
      }
      HOST + options.to_param
    end

    def finish_line_static_polyline(finish_line)
      color = '0xff0000ff'
      weight = '3'
      start, finish = finish_line.to_coordinates.map { |coord| [coord[:latitude], coord[:longitude]].join(',') }
      ["color:#{color}", "weight:#{weight}", start, finish].join('|')
    end
  end
end
