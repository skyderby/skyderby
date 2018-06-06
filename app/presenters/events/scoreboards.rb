module Events
  module Scoreboards
    def self.for(event, params)
      if event.fai? || event.speed_distance_time?
        SpeedDistanceTime.new(event, params)
      elsif event.hungary_boogie?
        HungaryBoogie.new(event, params)
      else
        raise NotImplementedError, "Scoreboard for #{event.rules.inspect} is not defined"
      end
    end
  end
end
