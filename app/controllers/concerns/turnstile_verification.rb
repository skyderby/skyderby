module TurnstileVerification
  extend ActiveSupport::Concern

  TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'.freeze

  private

  def verify_turnstile
    return true if Rails.env.test?
    return true if turnstile_secret_key.blank?

    token = params['cf_turnstile_response']
    return false if token.blank?

    response = Net::HTTP.post_form(
      URI(TURNSTILE_VERIFY_URL),
      secret: turnstile_secret_key,
      response: token,
      remoteip: request.remote_ip
    )

    JSON.parse(response.body)['success']
  rescue StandardError
    false
  end

  def turnstile_secret_key
    Rails.application.credentials.dig(:turnstile, :secret_key) || ENV.fetch('TURNSTILE_SECRET_KEY', nil)
  end
end
