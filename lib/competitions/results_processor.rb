require 'competitions/distance_processor.rb'
require 'competitions/speed_processor.rb'
require 'competitions/time_processor.rb'
require 'competitions/distance_in_time_processor.rb'
require 'competitions/time_until_line_processor.rb'

module ResultsProcessor
  # Содержит перечень доступных дисциплин и их обработчиков
  TASKS = {
    # Skydive
    distance: DistanceProcessor,
    speed: SpeedProcessor,
    time: TimeProcessor,
    # BASE
    distance_in_time: DistanceInTimeProcessor,
    time_until_line: TimeUntilLineProcessor
  }

  # track_id
  # discipline - type should be sym
  # params - hash with discipline specific params 
  def self.process(track_points, discipline, params)
    TASKS[discipline].process(track_points, params) 
  end
end
