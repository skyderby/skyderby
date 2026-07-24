class User::Setting < ApplicationRecord
  self.table_name = 'user_settings'

  belongs_to :user, inverse_of: :setting

  enum :default_units, { metric: 0, imperial: 1 }, default: :metric
  enum :default_chart_view, { multi: 0, single: 1 }, default: :multi
  enum :speed_skydiving_units, { metric: 0, imperial: 1 }, prefix: true, default: :metric

  attribute :dashboard_female_rankings, :boolean, default: false
  attribute :journal_period, :string, default: '1y'
end
