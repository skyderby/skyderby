module User::Omniauth
  extend ActiveSupport::Concern

  DEFAULT_PROFILE_NAME = 'Skyderby pilot'.freeze

  included do
    attr_accessor :password_generated

    before_save :track_password_set, if: :will_save_change_to_encrypted_password?
  end

  def add_data_from_google(auth)
    profile.userpic = self.class.remote_userpic(auth.info.image) unless profile.userpic.attached?
    identity = identities.find_or_initialize_by(provider: auth.provider.to_s, uid: auth.uid.to_s)
    identity.email ||= auth.info.email
  end

  def identity?(provider) = identities.any? { it.provider == provider.to_s }

  def link_apple_identity(apple_token, authorization_code: nil)
    link_identity(apple_token).tap do |identity|
      identity.store_apple_refresh_token(authorization_code, client_id: apple_token.client_id) if identity.errors.empty?
    end
  end

  def link_identity(token)
    provider = token.identity_attributes[:provider]
    identity = User::Identity.find_or_initialize_by(provider:, uid: token.uid)
    if identity.persisted? && identity.user_id != id
      identity.errors.add(:base, I18n.t("accounts.identities.linked_to_another_account.#{provider}"))
      return identity
    end

    identity.update!(token.identity_attributes.merge(user: self))
    identities.reset
    identity
  end

  module ClassMethods
    def remote_userpic(url)
      return if url.blank?

      io = URI.parse(url).open
      { io:, filename: "userpic#{Rack::Mime::MIME_TYPES.invert[io.content_type]}", content_type: io.content_type }
    end

    def from_omniauth(auth)
      attributes = { provider: auth.provider.to_s, uid: auth.uid.to_s, email: auth.info.email }

      from_identity(attributes) ||
        create_with_identity!(attributes,
                              name: [auth.info.first_name, auth.info.last_name].join(' '),
                              userpic: remote_userpic(auth.info.image))
    end

    def from_identity(attributes)
      identity = User::Identity.find_by(attributes.slice(:provider, :uid))
      return identity.user if identity

      email = attributes[:email]
      return if attributes[:private_email] || email.blank? || User::Identity.private_email?(email)

      find_by(email: email.strip.downcase)&.tap { it.identities.create!(attributes) }
    end

    def create_with_identity!(attributes, name:, userpic: nil)
      user = new(email: attributes[:email],
                 password: Devise.friendly_token[0, 20],
                 password_generated: true,
                 confirmed_at: Time.now.utc,
                 profile_attributes: { name: name.presence || DEFAULT_PROFILE_NAME, userpic: }.compact)
      user.identities.build(attributes)
      user.save!
      user
    end
  end

  private

  def track_password_set
    self.password_set = !password_generated
    self.password_generated = false
  end
end
