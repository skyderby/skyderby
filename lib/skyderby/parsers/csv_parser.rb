require 'csv'

module Skyderby
  module Parsers
    class CSVParser < TrackParser
      def parse(_index = 0)
        track_points = []
        CSV.parse(track_data) do |row|
          track_points << parse_row(row)
        end
        FileData.new(track_points.compact, logger)
      end

      protected

      def logger
        :cyber_eye
      end

      def parse_row(row)
        Skyderby::Tracks::TrackPoint.new(
          latitude: row[1].to_d,
          longitude: row[2].to_d,
          abs_altitude: row[3].to_f,
          h_speed: h_speed(row),
          v_speed: v_speed(row),
          gps_time: gps_time(row)
        )
      end

      private

      def h_speed(row)
        Velocity.to_kmh(Math.sqrt(row[4].to_f**2 + row[5].to_f**2))
      end

      def v_speed(row)
        Velocity.to_kmh(row[6].to_f)
      end

      def gps_time(row)
        Time.parse(row[0].to_s)
      end
    end
  end
end
