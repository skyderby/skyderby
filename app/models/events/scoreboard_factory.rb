module Events
  class ScoreboardFactory
    def initialize(event, display_raw_results)
      @event = event
      @display_raw_results = display_raw_results
    end

    def create
      scoreboard_class.new(@event, @display_raw_results)
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
