# GPS Model name = Dual XGPS160
module Skyderby
  module Parsers
    class KMLParser < TrackParser
      def parse(_index = 0)
        @track_points = []

        doc = Nokogiri::XML(@track_data)
        elements = doc.search('//gx:Track/*')

        current_point_time = nil
        elements.each do |elem|
          if elem.name == 'when'
            current_point_time = Time.zone.parse(elem.text)
            next
          end

          if current_point_time && elem.name == 'coord'
            point_params = elem.text.split(' ')
            @track_points << Point.new(
              latitude: point_params[1].to_f,
              longitude: point_params[0].to_f,
              abs_altitude: point_params[2].to_f,
              gps_time: current_point_time
            )
          end

          current_point_time = nil unless elem.name == 'when'
        end

        FileData.new(@track_points, :kml)
      end
    end
  end
end
