require 'competitions/results_processor'

module ResultsCalculator
  class ResCalc
    def initialize(track, round)
      @track = track
      @points = Skyderby::Tracks::Points.new(@track)
      @discipline = round.discipline.to_sym
      @params = {
        range_from: round.event.range_from,
        range_to: round.event.range_to
      }
    end

    def calculate
      ResultsProcessor.process @points, @discipline, @params
    end
  end

  def self.calculate(track, round)
    ResCalc.new(track, round).calculate
  end
end
