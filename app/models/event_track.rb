require 'results_calculator'

class EventTrack < ActiveRecord::Base
  belongs_to :track
  belongs_to :round
  belongs_to :competitor

  validates :competitor, presence: true
  validates :round, presence: true
  validates :track, presence: true

  attr_accessor :track_attributes

  before_save :calc_result

  def calc_result
    self.result = ResultsCalculator.calculate(track, round)
  end
end
