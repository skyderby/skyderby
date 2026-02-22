module TurnstileVerification
  extend ActiveSupport::Concern

  TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'.freeze

  private

  def verify_turnstile
    return true if Rails.env.test?
    return true if ENV['TURNSTILE_SECRET_KEY'].blank?

    token = params['cf_turnstile_response']
    return false if token.blank?

    response = Net::HTTP.post_form(
      URI(TURNSTILE_VERIFY_URL),
      secret: ENV.fetch('TURNSTILE_SECRET_KEY', nil),
      response: token,
      remoteip: request.remote_ip
    )

    JSON.parse(response.body)['success']
  rescue StandardError
    false
  end
end
