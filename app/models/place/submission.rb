class Place::Submission < ApplicationRecord
  belongs_to :place
  belongs_to :user
  belongs_to :track, optional: true

  scope :chronologically, -> { order(id: :desc) }

  delegate :name, to: :user, prefix: true, allow_nil: true
end
