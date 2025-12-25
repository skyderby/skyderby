class SpeedSkydivingCompetition < ApplicationRecord
  include Event::TrackVisibility, Event::Permissions

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  belongs_to :place
  with_options foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error do
    has_many :categories
    has_many :rounds
    has_many :competitors
    has_many :results
    has_many :teams
  end
  has_many :tracks, through: :results
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors,
           -> { order(:created_at) },
           as: :sponsorable,
           dependent: :delete_all,
           inverse_of: :sponsorable
  has_one :gps_recordings_archive, as: :event, dependent: :destroy

  delegate :name, to: :place, prefix: true, allow_nil: true

  after_create_commit :track_amplitude_event

  def active? = starts_at < Time.zone.now && !finished?

  def standings(until_round: nil) = Scoreboard.new(self, until_round:)

  def open_standings = OpenScoreboard.new(self)

  def team_standings = TeamStandings.new(self)

  def team_standings_code = "skyderby-speed-skydiving-#{id}-teams"

  def open_standings_code = "skyderby-speed-skydiving-open-#{id}"

  def standings_code(category_id) = "skyderby-speed-skydiving-#{id}-#{category_id}"

  def become_surprise? = saved_change_to_attribute?(:status, to: :surprise)

  def revert_from_surprise? = saved_change_to_attribute?(:status, from: :surprise)

  private

  def track_amplitude_event
    Amplitude.track(
      user_id: responsible_id,
      event: 'Competition Created',
      properties: {
        type: 'speed_skydiving',
        visibility: visibility,
        country: place&.country&.code
      }
    )
  end
end
