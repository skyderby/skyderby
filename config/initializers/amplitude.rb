AmplitudeAPI.config.api_key =
  Rails.application.credentials.dig(:amplitude, :api_key) || ENV.fetch('AMPLITUDE_API_KEY', nil)
AmplitudeAPI.config.options = { min_id_length: 1 }
