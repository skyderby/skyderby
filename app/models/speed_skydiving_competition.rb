class SpeedSkydivingCompetition < ApplicationRecord
  include CompetitionTrackVisibility

  enum status: { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum visibility: { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  belongs_to :place

  with_options foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error do
    has_many :categories
    has_many :rounds
    has_many :competitors
    has_many :results
    has_many :teams
  end

  def active? = starts_at < Time.zone.now && !finished?
end
