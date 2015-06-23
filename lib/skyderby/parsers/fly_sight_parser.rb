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

module Skyderby
  module Parsers
    class FlySightParser < CSVParser
      protected

      def logger
        :flysight
      end

      def parse_row(row)
        return nil if row_invalid(row)

        Skyderby::Tracks::TrackPoint.new(latitude: row[1],
                                         longitude: row[2],
                                         abs_altitude: row[3],
                                         h_speed: h_speed(row),
                                         v_speed: v_speed(row),
                                         gps_time: gps_time(row))
      end

      private

      def row_invalid(row)
        row[1].to_i == 0 || row[8].to_i > 70
      end
    end
  end
end
