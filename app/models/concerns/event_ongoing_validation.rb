module EventOngoingValidation
  extend ActiveSupport::Concern

  included do
    validate :validate_event_not_finished

    before_destroy :validate_event_not_finished
  end

  def validate_event_not_finished
    return unless event&.finished?

    errors.add(:base, :event_finished)
    throw :abort
  end
end
