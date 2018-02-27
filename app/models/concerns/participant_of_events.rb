# Concern used by User model and provides interface that used in policies
# to check permissions to view and change event or tournament
module ParticipantOfEvents
  extend ActiveSupport::Concern

  included do
    has_many :responsible_of_events,
             class_name: 'Event',
             foreign_key: 'responsible_id',
             dependent: :nullify,
             inverse_of: :responsible

    has_many :responsible_of_tournaments,
             class_name: 'Tournament',
             foreign_key: 'responsible_id',
             dependent: :nullify,
             inverse_of: :responsible

    has_many :organizers, dependent: :restrict_with_error
  end

  def organizer_of_events
    organizers.select(:organizable_id, :organizable_type).map(&:organizable)
  end

  def organizer_of_event?(event)
    (responsible_of_events + responsible_of_tournaments + organizer_of_events).include? event
  end

  def participant_of_events
    organizer_of_events + competitor_of_events
  end

  def competitor_of_events
    profile&.competitor_of_events || []
  end
end
