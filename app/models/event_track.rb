require 'results_calculator'

class EventTrack < ActiveRecord::Base
  belongs_to :track
  belongs_to :round
  belongs_to :competitor

  before_save :calc_result

  def calc_result
    self.result = ResultsCalculator.calculate(track, round)
  end

end
