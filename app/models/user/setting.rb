class User::Setting < ApplicationRecord
  self.table_name = 'user_settings'

  belongs_to :user, inverse_of: :setting

  enum :default_units, { metric: 0, imperial: 1 }, default: :metric
  enum :default_chart_view, { multi: 0, single: 1 }, default: :multi
  enum :speed_skydiving_units, { metric: 0, imperial: 1 }, prefix: true, default: :metric

  attribute :dashboard_female_rankings, :boolean, default: false
  attribute :journal_period, :string, default: '1y'

  def update_dashboard_preferences(profile:, mode: nil, rankings_gender: nil, journal_period: nil)
    self.dashboard_mode = mode.to_s if mode.to_s.in?(Profiles::Dashboard::MODES.map(&:to_s))
    self.journal_period = journal_period.to_s if journal_period.to_s.in?(Profiles::Journal::PERIODS)
    assign_female_rankings(rankings_gender) if profile&.female?
    save! if changed?
  end

  private

  def assign_female_rankings(rankings_gender)
    self.dashboard_female_rankings = rankings_gender.to_s == 'female' unless rankings_gender.nil?
  end
end
