class Point < ActiveRecord::Base
  belongs_to :tracksegment

  composed_of :gps_time,
              class_name: 'Time',
              mapping: %w(gps_time_in_seconds to_f),
              constructor: Proc.new { |t| Time.at(t) },
              converter: Proc.new { |t| t.is_a?(Time) ? t : Time.at(t/1000.0) }
end
