require 'results_calculator'

class EventTrack < ActiveRecord::Base
  attr_accessor :track_attributes

  belongs_to :track
  belongs_to :round
  belongs_to :competitor

  validates :competitor, presence: true
  validates :round, presence: true
  validates :track, presence: true

  delegate :event, to: :round

  before_validation :create_track_from_file
  before_save :calc_result

  private

  def calc_result
    self.result = ResultsCalculator.calculate(track, round)
  end

  def create_track_from_file
    track_id || create_track!(track_attributes)
  end
end
