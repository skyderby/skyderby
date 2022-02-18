class PerformanceCompetitionSeries::Round < ApplicationRecord
  enum discipline: { time: 0, distance: 1, speed: 2, vertical_speed: 3 }

  belongs_to :performance_competition_series

  before_create :set_number

  def includes?(round)
    discipline == round.discipline && number == round.number
  end

  private

  def set_number
    last_round_number =
      performance_competition_series
      .rounds
      .where(discipline: discipline.to_sym)
      .maximum(:number) || 0

    self.number = last_round_number + 1
  end
end
