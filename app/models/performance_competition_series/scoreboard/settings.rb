class PerformanceCompetitionSeries::Scoreboard::Settings
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :display_raw_results, :boolean, default: false
  attribute :omit_penalties, :boolean, default: false
  attribute :split_by_categories, :boolean, default: false
end
