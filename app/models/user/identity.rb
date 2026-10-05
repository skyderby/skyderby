class User::Identity < ApplicationRecord
  self.table_name = 'user_identities'

  APPLE = 'apple'.freeze
  GOOGLE = 'google_oauth2'.freeze
  APPLE_PRIVATE_RELAY_DOMAIN = '@privaterelay.appleid.com'.freeze

  belongs_to :user, inverse_of: :identities

  validates :provider, :uid, presence: true
  validates :uid, uniqueness: { scope: :provider }

  before_validation :detect_private_email, if: -> { email.present? && !private_email? }

  scope :apple, -> { where(provider: APPLE) }
  scope :chronologically, -> { order(:created_at, :id) }

  def self.private_email?(email) = email.to_s.downcase.end_with?(APPLE_PRIVATE_RELAY_DOMAIN)

  def apple? = provider == APPLE

  def removable? = user.password_set? || user.identities.where.not(id:).exists?

  def store_apple_refresh_token(authorization_code, client_id: nil)
    return if authorization_code.blank?

    token = AppleAuthorization.exchange(authorization_code, client_id:)
    update!(apple_refresh_token: token) if token
  end

  def revoke_apple_token
    return unless apple? && apple_refresh_token.present?

    AppleAuthorization.revoke(apple_refresh_token)
    update!(apple_refresh_token: nil) if persisted? && !destroyed?
  end

  private

  def detect_private_email
    self.private_email = self.class.private_email?(email)
  end
end
