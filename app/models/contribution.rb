class Contribution < ApplicationRecord
  has_many :details, dependent: :destroy

  scope :in_this_month, -> { where("received_at >= DATE_TRUNC('month', NOW())")}
  scope :in_past_days, ->(days) { where("received_at > NOW() - interval '#{days} days'") }
  scope :chronologically, -> { order(received_at: :desc) }
end
