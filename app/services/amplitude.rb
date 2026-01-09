module Amplitude
  def self.track(user_id:, event:, properties: {})
    return if AmplitudeAPI.config.api_key.blank?

    response = AmplitudeAPI.track(
      AmplitudeAPI::Event.new(
        user_id: user_id.to_s,
        event_type: event,
        event_properties: properties
      )
    )

    report_error(event:, user_id:, response:) unless response.status == 200

    response
  rescue StandardError => e
    Rails.error.report(e, context: { amplitude_event: event, user_id: })
  end

  def self.identify(user_id:, properties: {})
    return if AmplitudeAPI.config.api_key.blank?

    AmplitudeAPI.send_identify(user_id.to_s, nil, user_properties: properties)
  rescue StandardError => e
    Rails.error.report(e, context: { amplitude_action: 'identify', user_id: })
  end

  def self.report_error(event:, user_id:, response:)
    Rails.error.report(
      StandardError.new("Amplitude API error: #{response.status}"),
      context: { amplitude_event: event, user_id:, response_body: response.body }
    )
  end

  private_class_method :report_error
end
