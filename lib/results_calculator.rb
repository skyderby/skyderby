require 'velocity'

class ResultsCalculator

  def initialize(track, round)
    @track = track
    @round = round
    @range_from = round.event.comp_range_from
    @range_to = round.event.comp_range_to
  end

  def calculate

    points = TrackPoints.new(@track).trim_interpolize(@range_from, @range_to)
    fl_time = points.map{ |x| x[:fl_time] }.inject(0, :+)
    distance = points.map{ |x| x[:distance] }.inject(0, :+)

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