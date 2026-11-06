class FlightProfilePlayback < ApplicationRecord
  MONTHLY_LIMIT = 5

  belongs_to :user
  belongs_to :track

  scope :current_month, -> { where(month: Date.current.beginning_of_month) }
end
