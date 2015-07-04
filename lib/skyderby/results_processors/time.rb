# Time Task: The wingsuit flyer is to fly with the slowest fall
# rate possible through the competition window. The result for
# this task will be the time taken to fly through the competition
# window, expressed in seconds, rounded to one decimal place.

module Skyderby
  module ResultsProcessors
    class Time < SkydiveProcessor
      def calculate
        return 0 unless @end_point && @start_point

        (@end_point.fl_time_abs - @start_point.fl_time_abs).round(1)
      end
    end
  end
end
