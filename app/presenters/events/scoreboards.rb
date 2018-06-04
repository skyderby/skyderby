module Events
  module Scoreboards
    def self.for(event, display_raw_results)
      if event.fai? || event.speed_distance_time?
        SpeedDistanceTime.new(event, display_raw_results)
      elsif event.hungary_boogie?
        HungaryBoogie.new(event, display_raw_results)
      else
        raise NotImplementedError, "Scoreboard for #{event.rules.inspect} is not defined"
      end
    end
  end
end
