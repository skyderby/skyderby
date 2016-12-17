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
        # Point.new(
        {
          latitude: row[1],
          longitude: row[2],
          abs_altitude: row[3],
          h_speed: h_speed(row),
          v_speed: v_speed(row),
          gps_time: gps_time(row)
        }
      end

      private

      def h_speed(row)
        Velocity.new(Math.sqrt(row[4].to_f**2 + row[5].to_f**2)).to_kmh
      end

      def v_speed(row)
        Velocity.new(row[6].to_f).to_kmh
      end

      def gps_time(row)
        Time.zone.parse(row[0].to_s)
      end
    end
  end
end
