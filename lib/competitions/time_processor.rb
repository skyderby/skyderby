# Time Task: The wingsuit flyer is to fly with the slowest fall 
# rate possible through the competition window. The result for 
# this task will be the time taken to fly through the competition 
# window, expressed in seconds, rounded to one decimal place.

require 'competitions/skydive_result_processor'

module TimeProcessor
  class TimeProcessing < SkydiveResultProcessor
    def calculate
      return 0 unless @comp_window.end_point && @comp_window.start_point

      (@comp_window.end_point.fl_time_abs - 
        @comp_window.start_point.fl_time_abs).round(1)
    end
  end

  def self.process(track_id, params)
    TimeProcessing.new(track_id, params).calculate
  end
end
