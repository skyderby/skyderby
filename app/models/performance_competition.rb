class PerformanceCompetition < ApplicationRecord
  self.table_name = :events
  default_scope -> { where(rules: :speed_distance_time) }

  include Event::Permissions, Event::TrackVisibility, DesignatedLane, CompetitorsCopy

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :rules, { speed_distance_time: 0 }, default: :speed_distance_time
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events

  belongs_to :place, optional: true

  has_many :categories, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :competitors, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :rounds, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :teams, foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error
  has_many :results, foreign_key: :event_id, through: :rounds
  has_many :reference_point_assignments, through: :rounds
  has_many :tracks, through: :results
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors, as: :sponsorable, dependent: :delete_all, inverse_of: :sponsorable
  has_one :gps_recordings_archive, as: :event, dependent: :destroy

  validates :name, :range_from, :range_to, :starts_at, presence: true

  before_create do
    self.apply_penalty_to_score = false
  end

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 2500
    self.range_to ||= 1500
  end

  def active? = starts_at < Time.zone.now && !finished?

  def standings(wind_cancellation: false) = PerformanceCompetition::Scoreboard.new(self, wind_cancellation:)

  def team_standings(wind_cancellation: false) = PerformanceCompetition::TeamStandings.new(self, wind_cancellation:)

  def use_open_standings? = categories.many?

  def open_standings(wind_cancellation: false) = OpenScoreboard.new(self, wind_cancellation:)

  def task_standings(task, wind_cancellation: false) = TaskScoreboard.new(self, task, wind_cancellation:)

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
