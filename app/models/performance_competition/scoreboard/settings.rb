class PerformanceCompetition::Scoreboard::Settings
  include ActiveModel::Model, ActiveModel::Attributes

  attribute :display_raw_results, :boolean, default: true
  attribute :omit_penalties, :boolean, default: false
  attribute :split_by_categories, :boolean, default: true
end
