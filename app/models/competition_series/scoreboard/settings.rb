class CompetitionSeries::Scoreboard::Settings
  include ActiveModel::Model, ActiveModel::Attributes

  attribute :display_raw_results, :boolean, default: false
  attribute :omit_penalties, :boolean, default: false
  attribute :split_by_categories, :boolean, default: false
end
