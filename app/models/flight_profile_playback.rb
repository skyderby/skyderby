class FlightProfilePlayback < ApplicationRecord
  MONTHLY_LIMIT = 5

  belongs_to :user
  belongs_to :track

  validates :track_id, uniqueness: { scope: %i[user_id month] }

  scope :current_month, -> { where(month: Date.current.beginning_of_month) }
end
