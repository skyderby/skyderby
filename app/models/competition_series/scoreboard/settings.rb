class CompetitionSeries::Scoreboard::Settings
  include ActiveModel::Model, ActiveModel::Attributes

  attribute :display_raw_results, :boolean, default: false
  attribute :omit_penalties, :boolean, default: false
  attribute :split_by_categories, :boolean, default: false

  attr_writer :excluded_rounds

  def excluded_rounds
    (@excluded_rounds || []).map(&:downcase)
  end
end
