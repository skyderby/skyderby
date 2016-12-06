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
end
