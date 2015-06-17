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
        return nil if row_invalid(row)

        TrackPoint.new(latitude: row[1].to_d,
                       longitude: row[2].to_d,
                       elevation: row[3].to_f,
                       h_speed: h_speed(row),
                       v_speed: v_speed(row),
                       abs_altitude: row[3].to_f,
                       gps_time: gps_time(row))
      end

      private

      def row_invalid(row)
        row[1].to_i == 0 || row[8].to_i > 70
      end
    end
  end
end
