class SpeedSkydivingCompetitionSeries < ApplicationRecord
  enum status: { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum visibility: { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  has_many :rounds, dependent: :destroy
  has_many :included_competitions, dependent: :destroy
  has_many :competitions, through: :included_competitions, source: :speed_skydiving_competition

  validates :name, presence: true

  def active? = started && !finished?

  def started = starts_at && starts_at < Time.zone.now

  def starts_at = competitions.minimum(:starts_at)
end
