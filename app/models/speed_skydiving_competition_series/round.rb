class SpeedSkydivingCompetitionSeries::Round < ApplicationRecord
  belongs_to :speed_skydiving_competition_series

  before_create :set_number

  def includes?(round) = number == round.number

  private

  def set_number
    last_round_number = speed_skydiving_competition_series.rounds.maximum(:number) || 0
    self.number = last_round_number + 1
  end
end
