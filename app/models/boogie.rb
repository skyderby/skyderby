class Boogie < ApplicationRecord
  self.table_name = :events
  default_scope -> { where(rules: :hungary_boogie) }

  include Event::Permissions, Event::TrackVisibility

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :rules, { hungary_boogie: 2 }, default: :hungary_boogie
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  belongs_to :place, optional: true

  has_many :categories, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :competitors, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :rounds, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :results, foreign_key: :event_id, through: :rounds
  has_many :tracks, through: :results
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors, as: :sponsorable, dependent: :delete_all, inverse_of: :sponsorable
  has_one :gps_recordings_archive, as: :event, dependent: :destroy

  validates :name, :range_from, :range_to, :starts_at, presence: true

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 2500
    self.range_to ||= 1500
  end

  def active? = starts_at < Time.zone.now && !finished?

  def standings = Boogie::Scoreboard.new(self)

  def permanently_delete(including_tracks: false)
    transaction do
      tracks_to_delete = tracks.to_a

      results.to_a.each(&:destroy!)
      tracks_to_delete.each(&:destroy!) if including_tracks

      rounds.destroy_all
      competitors.destroy_all
      categories.destroy_all

      destroy!
    end
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
