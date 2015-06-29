# Distance Task: The wingsuit flyer is to fly as far as possible
# through the competition window. The result for this task will
# be the straight-line distance flown over the ground while in
# the competition window, expressed in meters, rounded to whole numbers.

module Skyderby
  module ResultsProcessors
    class Distance < SkydiveProcessor
      def calculate
        return 0 unless @end_point && @start_point

        Geospatial.distance_between_points(
          @start_point,
          @end_point
        ).round
      end
    end
  end
end
