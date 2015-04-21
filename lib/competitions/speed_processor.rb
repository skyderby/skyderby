# Speed Task: The wingsuit flyer is to fly as fast as possible 
# horizontally over the ground through the competition window. 
# The result for this task will be the straight-line distance 
# flown over the ground while in the competition window divided by 
# the time spent in the competition window, expressed in meters 
# per second (m/s), rounded to one decimal place.

require 'velocity'
require 'geospatial'
require 'competitions/skydive_result_processor'

module SpeedProcessor
  class SpeedProcessing < SkydiveResultProcessor
    def calculate
      time = @comp_window.end_point.fl_time_abs - @comp_window.start_point.fl_time_abs
      distance = Geospatial.distance_between_points(
        @comp_window.start_point, 
        @comp_window.end_point
      )

      Velocity.to_kmh(distance / time).round(1)
    end
  end

  def self.process(track_id, params)
    SpeedProcessing.new(track_id, params).calculate
  end
end
