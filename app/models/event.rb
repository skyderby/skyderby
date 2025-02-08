class Event < ApplicationRecord
  self.table_name = 'event_lists'

  belongs_to :event, polymorphic: true
  belongs_to :responsible, class_name: 'User'
  belongs_to :place, optional: true

  enum :status, { draft: 0, published: 1, finished: 2 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  def active?
    starts_at < Time.zone.now && !finished?
  end

  def self.visible(user = Current.user)
    return all if user.admin?

    public_event
      .where(status: [Event.statuses[:published], Event.statuses[:finished]])
      .or(where(responsible: user))
      .or(where(event: user.participant_of_events))
  end

  def self.by_activity(activity)
    speed_types = %w[SpeedSkydivingCompetition SpeedSkydivingCompetitionSeries]

    case activity.to_s
    when 'skydive', 'base'
      left_joins(:place)
        .where.not(event_type: speed_types)
        .where(places: { kind: activity })
    when 'speed_skydiving'
      where(event_type: speed_types)
    else
      all
    end
  end

  def self.search(term)
    return all if term.blank?

    where('event_lists.name ILIKE ?', "%#{term}%")
  end

  private

  def read_only? = true
end
