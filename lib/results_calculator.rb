require 'velocity'

module ResultsCalculator
  class ResCalc
    def initialize(track, round)
      @track = track
      @round = round
      @range_from = round.event.range_from
      @range_to = round.event.range_to
    end

    def calculate
      points = TrackPoints.new(@track).trim_interpolize(@range_from, @range_to)
      fl_time = points.map { |x| x[:fl_time] }.inject(0, :+)
      distance = Geospatial.distance(
        [points.first[:latitude], points.first[:longitude]],
        [points.last[:latitude], points.last[:longitude]]
      )
      # distance = points.map { |x| x[:distance] }.inject(0, :+)

      if @round.time?
        fl_time.round(1)
      elsif @round.distance?
        distance.round
      elsif @round.speed?
        Velocity.to_kmh(distance / fl_time).round
      else
        nil
      end
    end
  end

  def self.calculate(track, round)
    ResCalc.new(track, round).calculate
  end
end
