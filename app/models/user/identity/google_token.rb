class User::Identity::GoogleToken
  attr_reader :uid, :email, :given_name, :family_name, :picture

  def initialize(payload)
    @uid = payload['sub']
    @email = payload['email'].presence if ActiveModel::Type::Boolean.new.cast(payload['email_verified'])
    @given_name = payload['given_name']
    @family_name = payload['family_name']
    @picture = payload['picture']
  end

  def private_email? = false

  def identity_attributes = { provider: User::Identity::GOOGLE, uid:, email: }.compact

  class << self
    def verify(token) = new(GoogleIdToken.decode(token, audience: client_ids))

    def client_ids
      configured = Rails.application.credentials.dig(:google, :client_ids) || ENV.fetch('GOOGLE_CLIENT_IDS', nil)
      ids = configured.is_a?(String) ? configured.split(',') : Array(configured)
      ids << (Rails.application.credentials.dig(:google, :client_id) || ENV.fetch('GOOGLE_CLIENT_ID', nil))
      ids.map { it.to_s.strip }.compact_blank.uniq
    end
  end
end
