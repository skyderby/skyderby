class SpeedSkydivingCompetition < ApplicationRecord
  include EventTrackVisibility

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  belongs_to :place
  has_many :organizers, as: :organizable, dependent: :delete_all
  with_options foreign_key: :event_id, inverse_of: :event, dependent: :restrict_with_error do
    has_many :categories
    has_many :rounds
    has_many :competitors
    has_many :results
    has_many :teams
  end
  has_many :tracks, through: :results

  delegate :name, to: :place, prefix: true, allow_nil: true

  def active? = starts_at < Time.zone.now && !finished?

  def standings = Scoreboard.new(self)

  def open_standings = OpenScoreboard.new(self)

  def team_standings = TeamStandings.new(self)

  def team_standings_code = "skyderby-speed-skydiving-#{id}-teams"

  def open_standings_code = "skyderby-speed-skydiving-open-#{id}"

  def standings_code(category_id) = "skyderby-speed-skydiving-#{id}-#{category_id}"

  def editable?(user = Current.user)
    @editable ||= user.admin? || user == responsible || organizers.exists?(user:)
  end

  def viewable?(user = Current.user)
    return true if editable?
    return false if draft?
    return true if public_event? || unlisted_event?

    competitors.exists?(profile_id: user&.profile_id)
  end

  def self.creatable?(user = Current.user)
    user.registered?
  end

  def become_surprise? = saved_change_to_attribute?(:status, to: :surprise)

  def revert_from_surprise? = saved_change_to_attribute?(:status, from: :surprise)
end
