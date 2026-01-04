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

  def self.identify(user_id:, properties: {})
    return if AmplitudeAPI.config.api_key.blank?

    AmplitudeAPI.send_identify(user_id.to_s, nil, user_properties: properties)
  rescue StandardError => e
    Rails.logger.error("Amplitude identify error: #{e.message}")
  end
end
