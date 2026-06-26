class AmplitudeTrackingJob < ApplicationJob
  def perform(user_id:, event:, properties: {})
    Amplitude.track(user_id:, event:, properties:)
  end
end
