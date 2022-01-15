class Contribution < ApplicationRecord
  has_many :details, dependent: :destroy

  scope :chronologically, -> { order(received_at: :desc) }
end
