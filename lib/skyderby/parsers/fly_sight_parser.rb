# Columns:
# FlySight old firmware:
# time
# lat
# lon
# hMSL
# velN
# velE
# velD
# hAcc
# vAcc
# sAcc
# gpsFix
# numSV
#
# FlySight newest firmware
# time
# lat
# lon
# hMSL
# velN
# velE
# velD
# hAcc
# vAcc
# sAcc
# heading
# cAcc
# gpsFix
# numSV

require 'velocity'
require 'tracks/track_point'

module Skyderby
  module Parsers
    class FlySightParser < CSVParser
      protected

      def parse_row(row)
        return nil if row_valid(row)

        TrackPoint.new(latitude: row[1].to_d,
                       longitude: row[2].to_d,
                       elevation: row[3].to_f,
                       h_speed: h_speed(row),
                       v_speed: v_speed(row),
                       abs_altitude: row[3].to_f,
                       gps_time: gps_time(row))
      end

      private

      def row_valid(row)
        row[1].to_i == 0 || row[8].to_i > 70
      end

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
