# Columns:
# INDEX
# TAG
# DATE
# TIME
# LATITUDE N/S
# LONGITUDE E/W
# HEIGHT
# SPEED
# HEADING
# VOX
#

module Skyderby
  module Parsers
    class ColumbusParser < CSVParser
      # Column indexes
      INDEX     = 0
      TAG       = 1
      DATE      = 2
      TIME      = 3
      LATITUDE  = 4
      LONGITUDE = 5
      HEIGHT    = 6
      SPEED     = 7
      HEADING   = 8
      VOX       = 9

      # Coordinates suffixes
      NORTH = 'N'
      SOUTH = 'S'
      EAST = 'E'
      WEST = 'W'

      protected

      def logger
        :columbus
      end

      def parse_row(row)
        row_height = row[HEIGHT].to_f
        return nil if row_height == 0.0

        Skyderby::Tracks::TrackPoint.new(
          latitude: parse_latitude(row),
          longitude: parse_longitude(row),
          abs_altitude: row_height,
          gps_time: parse_datetime(row)
        )
      end

      private

      def parse_coordinate(coordinate)
        coordinate_suffix = coordinate[coordinate.length - 1]
        coordinate_value = coordinate[0..(coordinate.length - 2)]

        -coordinate_value if [SOUTH, WEST].include? coordinate_suffix
      end

      def parse_latitude(row)
        parse_coordinate(row[LATITUDE]).to_f
      end

      def parse_longitude(row)
        parse_coordinate(row[LONGITUDE]).to_f
      end

      def parse_datetime(row)
        date_str = '20' + row[DATE].to_s
        time_str = row[TIME].to_s

        Time.strptime("#{date_str}T#{time_str}", '%Y%m%dT%H%M%S')
      end
    end
  end
end
