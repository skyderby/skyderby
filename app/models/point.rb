# == Schema Information
#
# Table name: points
#
#  id                  :integer          not null, primary key
#  fl_time             :float
#  latitude            :decimal(15, 10)
#  longitude           :decimal(15, 10)
#  elevation           :float
#  distance            :float
#  v_speed             :float
#  h_speed             :float
#  abs_altitude        :float
#  gps_time_in_seconds :decimal(17, 3)
#  track_id            :integer
#

class Point < ApplicationRecord
  belongs_to :track

  composed_of :gps_time,
              class_name: 'Time',
              mapping: %w(gps_time_in_seconds to_f),
              constructor: proc { |t| Time.zone.at(t) },
              converter: proc { |t| t.is_a?(Time) ? t : Time.zone.at(t / 1000.0) }

  scope :freq_1hz, -> { where('round(gps_time_in_seconds) = gps_time_in_seconds') }

  scope :trimmed, ->(seconds_before_start: 0, seconds_after_end: 0) {
    joins <<~SQL
      INNER JOIN tracks
      ON tracks.id = points.track_id
      AND points.fl_time BETWEEN (tracks.ff_start - #{seconds_before_start})
                            AND (tracks.ff_end + #{seconds_after_end})
    SQL
  }

  class << self
    def bulk_insert(points:, track_id:)
      points.each { |point| point.track_id = track_id }
      insert_values = points.map { |point| point_db_statement(point) }.join(",\n")
      sql = "INSERT INTO points (#{db_columns})
             VALUES #{insert_values}"

      ActiveRecord::Base.connection.execute sql
    end

    def point_db_statement(point)
      statement = <<~SQL
        (#{point.gps_time.to_f},
         #{point.latitude},
         #{point.longitude},
         #{point.abs_altitude},
         #{point.distance},
         #{point.fl_time},
         #{point.v_speed},
         #{point.h_speed},
         #{point.track_id})
      SQL
      statement.delete("\n")
    end

    def db_columns
      ' gps_time_in_seconds,
        latitude,
        longitude,
        abs_altitude,
        distance,
        fl_time,
        v_speed,
        h_speed,
        track_id'
    end
  end
end
