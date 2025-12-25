module Amplitude
  def self.track(user_id:, event:, properties: {})
    return if AmplitudeAPI.config.api_key.blank?

    AmplitudeAPI.track(
      AmplitudeAPI::Event.new(
        user_id: user_id.to_s,
        event_type: event,
        event_properties: properties
      )
    )
  rescue StandardError => e
    Rails.logger.error("Amplitude tracking error: #{e.message}")
  end
end
