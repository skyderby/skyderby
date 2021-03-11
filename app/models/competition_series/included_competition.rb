class CompetitionSeries::IncludedCompetition < ApplicationRecord
  belongs_to :competition_series
  belongs_to :event
end
