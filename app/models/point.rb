class Point < ApplicationRecord
  belongs_to :track

  composed_of :gps_time,
              class_name: 'Time',
              mapping: %w[gps_time_in_seconds to_f],
              constructor: proc { |t| Time.zone.at(t) },
              converter: proc { |t| t.is_a?(Time) ? t : Time.zone.at(t / 1000.0) }

  scope :freq_1hz, -> { where('round(gps_time_in_seconds) = gps_time_in_seconds') }

  scope :trimmed, ->(seconds_before_start: 0, seconds_after_end: 0) {
    joins <<~SQL.squish
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
      <<~SQL.squish
        (#{point.gps_time.to_f},
         #{point.latitude},
         #{point.longitude},
         #{point.abs_altitude},
         #{point.distance},
         #{point.fl_time},
         #{point.v_speed},
         #{point.h_speed},
         #{nullable(point.horizontal_accuracy)},
         #{nullable(point.vertical_accuracy)},
         #{nullable(point.speed_accuracy)},
         #{nullable(point.heading)},
         #{nullable(point.heading_accuracy)},
         #{nullable(point.gps_fix)},
         #{nullable(point.number_of_satellites)},
         #{point.track_id})
      SQL
    end

    def db_columns
      %w[
        gps_time_in_seconds
        latitude
        longitude
        abs_altitude
        distance
        fl_time
        v_speed
        h_speed
        horizontal_accuracy
        vertical_accuracy
        speed_accuracy
        heading
        heading_accuracy
        gps_fix
        number_of_satellites
        track_id
      ].join(', ')
    end

    def nullable(field)
      field || 'NULL'
    end
  end
end
