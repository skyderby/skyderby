module Events
  class ScoreboardFactory
    def initialize(event)
      @event = event
    end

    def create
      scoreboard_class.new(@event)
    end

    private

    def scoreboard_class
      if @event.fai? || @event.speed_distance_time?
        Scoreboards::SpeedDistanceTime
      else
        fail 'not implemented error'
      end
    end
  end
end
