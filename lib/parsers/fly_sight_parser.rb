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

class FlySightParser < CSVParser

  protected

  def parse_row(row)

    return nil if (row[1].to_i == 0 || row[8].to_i > 70)

    TrackPoint.new({ 
      latitude: row[1].to_d,
      longitude: row[2].to_d,
      elevation: row[3].to_f,
      h_speed: Velocity.to_kmh(Math.sqrt(row[4].to_f ** 2 + row[5].to_f ** 2)),
      v_speed: Velocity.to_kmh(row[6].to_f),
      abs_altitude: row[3].to_f,
      point_created_at: Time.parse(row[0].to_s) 
    })
  end
end
