# Distance Task: The wingsuit flyer is to fly as far as possible
# through the competition window. The result for this task will
# be the straight-line distance flown over the ground while in
# the competition window, expressed in meters, rounded to whole numbers.

require 'geospatial'
require 'competitions/skydive_result_processor'

module DistanceProcessor
  class DistanceProcessing < SkydiveResultProcessor
    def calculate
      return 0 unless @comp_window.end_point && @comp_window.start_point

      Geospatial.distance_between_points(
        @comp_window.start_point,
        @comp_window.end_point
      ).round
    end
  end

  def self.process(track_id, params)
    DistanceProcessing.new(track_id, params).calculate
  end
end
