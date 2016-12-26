module EventOngoingValidation
  extend ActiveSupport::Concern

  included do
    validate :event_ongoing_validation

    before_destroy :event_ongoing_validation
  end

  def event_ongoing_validation
    return unless event&.finished?

    errors.add(:base, :event_finished)
    throw :abort
  end
end
