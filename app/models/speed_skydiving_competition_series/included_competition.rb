class SpeedSkydivingCompetitionSeries::IncludedCompetition < ApplicationRecord
  belongs_to :speed_skydiving_competition_series
  belongs_to :speed_skydiving_competition
end
