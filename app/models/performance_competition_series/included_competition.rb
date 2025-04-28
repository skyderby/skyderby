class PerformanceCompetitionSeries::IncludedCompetition < ApplicationRecord
  belongs_to :performance_competition_series
  belongs_to :event, class_name: 'PerformanceCompetition'
end
