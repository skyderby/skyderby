# == Schema Information
#
# Table name: points
#
#  id                  :integer          not null, primary key
#  track_id            :integer
#  fl_time             :float
#  latitude            :decimal(15, 10)
#  longitude           :decimal(15, 10)
#  elevation           :float
#  point_created_at    :datetime
#  created_at          :datetime
#  updated_at          :datetime
#  distance            :float
#  v_speed             :float
#  h_speed             :float
#  abs_altitude        :float
#  gps_time_in_seconds :decimal(17, 3)
#

class Point < ApplicationRecord
  belongs_to :track

  composed_of :gps_time,
              class_name: 'Time',
              mapping: %w(gps_time_in_seconds to_f),
              constructor: proc { |t| Time.zone.at(t) },
              converter: proc { |t| t.is_a?(Time) ? t : Time.zone.at(t / 1000.0) }

  scope :freq_1Hz, -> { where('round(gps_time_in_seconds) = gps_time_in_seconds') }

  scope :trimmed, -> (seconds_before_start: 0, seconds_after_end: 0) { 
    joins(:track)
    .where("points.fl_time 
              BETWEEN (tracks.ff_start - #{seconds_before_start})
              AND (tracks.ff_end + #{seconds_after_end})")
  }

  after_initialize :default_values

  def default_values
    self.fl_time ||= 0.0
    self.distance ||= 0.0
    self.h_speed ||= 0.0
    self.v_speed ||= 0.0
  end

  def self.bulk_insert(points: , track_id: )
    points.each { |point| point.track_id = track_id } if track_id
    insert_values = points.map { |point| point.to_db_statement }.join(",\n")
    sql = "INSERT INTO points (#{Point.db_columns})
           VALUES #{insert_values}"

    ActiveRecord::Base.connection.execute sql
  end

  def to_db_statement
    statement = <<~SQL
      (#{gps_time.to_f},
      #{latitude},
      #{longitude},
      #{abs_altitude},
      #{distance},
      #{fl_time},
      #{v_speed},
      #{h_speed},
      #{track_id},
      '#{current_time}',
      '#{current_time}')
    SQL
    statement.gsub("\n", "")
  end

  private

  def self.db_columns
    ' gps_time_in_seconds,
      latitude,
      longitude,
      abs_altitude,
      distance,
      fl_time,
      v_speed,
      h_speed,
      track_id,
      updated_at,
      created_at'
  end

  def current_time
    Time.zone.now.to_s(:db)
  end
end
