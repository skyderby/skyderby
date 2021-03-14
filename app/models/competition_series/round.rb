class CompetitionSeries::Round < ApplicationRecord
  enum discipline: { time: 0, distance: 1, speed: 2, vertical_speed: 3 }

  belongs_to :competition_series

  before_create :set_number

  def includes?(round)
    discipline == round.discipline && number == round.number
  end

  private

  def set_number
    current_number =
      competition_series.rounds.where(discipline: discipline.to_sym).maximum(:number) || 0

    self.number = current_number + 1
  end
end
