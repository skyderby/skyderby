module EventOngoingValidation
  extend ActiveSupport::Concern

  included do
    validate :event_ongoing_validation

    before_destroy :event_ongoing_validation
  end

  def event_ongoing_validation
    return true unless event && event.finished?

    errors.add(:base, :event_finished) 
    false
  end
end
