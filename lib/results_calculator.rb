require 'competitions/results_processor'

module ResultsCalculator
  class ResCalc
    def initialize(track, round)
      @track = track
      @discipline = round.discipline.to_sym
      @params = {
        range_from: round.event.range_from,
        range_to: round.event.range_to
      }
    end

    def calculate
      ResultsProcessor.process @track, @discipline, @params
    end
  end

  def self.calculate(track, round)
    ResCalc.new(track, round).calculate
  end
end
