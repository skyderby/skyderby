# Speed Task: The wingsuit flyer is to fly as fast as possible
# horizontally over the ground through the competition window.
# The result for this task will be the straight-line distance
# flown over the ground while in the competition window divided by
# the time spent in the competition window, expressed in meters
# per second (m/s), rounded to one decimal place.
module Skyderby
  module ResultsProcessors
    class Speed < SkydiveProcessor
      def calculate
        return 0 unless @end_point && @start_point

        time = @end_point.fl_time_abs - @start_point.fl_time_abs
        distance = Geospatial.distance_between_points(
          @start_point,
          @end_point
        )

        Velocity.ms_to_kmh(distance / time).round(1)
      end
    end
  end
end
