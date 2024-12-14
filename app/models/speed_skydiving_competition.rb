class SpeedSkydivingCompetition < ApplicationRecord
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

  def active? = starts_at < Time.zone.now && !finished?

  def standings = Scoreboard.new(self)

  def editable?(user = Current.user)
    @editable ||= user.admin? || user == responsible || organizers.exists?(user:)
  end

  def viewable?(user = Current.user)
    return true if editable?
    return false if draft?
    return true if public_event? || unlisted_event?

    competitors.exists?(profile_id: user&.profile_id)
  end
end
