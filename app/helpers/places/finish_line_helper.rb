module Places
  module FinishLineHelper
    RED = '0xff0000ff'.freeze
    YELLOW = '0xffFF00FF'.freeze
    PATH_WEIGHT = '3'.freeze
    HOST = 'https://maps.googleapis.com/maps/api/staticmap?'.freeze

    def finish_line_static_map(finish_line)
      center = finish_line.center
      options = {
        size: '600x400',
        center: "#{center[:latitude]} #{center[:longitude]}",
        zoom: 15,
        maptype: 'satellite',
        key: maps_api_key
      }

      src = [
        HOST + options.to_param,
        static_polyline_path(YELLOW, finish_line.place, center),
        static_polyline_path(RED, *finish_line.to_coordinates)
      ].join('&')

      image_tag(src, class: 'img-responsive', alt: finish_line.name)
    end

    def static_polyline_path(color, *coordinates)
      start, finish = coordinates.map do |coord|
        [coord[:latitude], coord[:longitude]].join(',')
      end
      { path: ["color:#{color}", "weight:#{PATH_WEIGHT}", start, finish].join('|') }.to_param
    end
  end
end
