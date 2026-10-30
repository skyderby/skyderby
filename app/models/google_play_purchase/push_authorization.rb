class GooglePlayPurchase::PushAuthorization
  def self.valid?(authorization_header)
    token = authorization_header.to_s.delete_prefix('Bearer ').strip
    return false if token.blank? || audience.blank? || service_account.blank?

    payload = GoogleIdToken.decode(token, audience:)
    payload['email'] == service_account && ActiveModel::Type::Boolean.new.cast(payload['email_verified'])
  rescue GoogleIdToken::InvalidToken
    false
  end

  def self.audience = config(:push_audience, 'GOOGLE_PLAY_PUSH_AUDIENCE')

  def self.service_account = config(:push_service_account, 'GOOGLE_PLAY_PUSH_SERVICE_ACCOUNT')

  def self.config(key, env) = Rails.application.credentials.dig(:google_play, key) || ENV.fetch(env, nil)
end
