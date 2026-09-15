module User::Omniauth
  extend ActiveSupport::Concern

  def add_data_from_google(auth)
    profile.userpic = self.class.remote_userpic(auth.info.image) unless profile.userpic.attached?
    assign_attributes(provider: auth.provider, uid: auth.uid)
  end

  class_methods do
    def remote_userpic(url)
      return if url.blank?

      io = URI.parse(url).open
      { io:, filename: "userpic#{Rack::Mime::MIME_TYPES.invert[io.content_type]}", content_type: io.content_type }
    end

    def from_omniauth(auth)
      search_keys = { provider: auth.provider, uid: auth.uid }

      find_by(**search_keys) ||
        find_by(email: auth.info.email).tap { |user| user&.update(**search_keys) } ||
        create_from_omniauth(auth)
    end

    def create_from_omniauth(auth)
      User.create! \
        provider: auth.provider,
        uid: auth.uid,
        email: auth.info.email,
        password: Devise.friendly_token[0, 20],
        confirmed_at: Time.now.utc,
        profile_attributes: {
          name: [auth.info.first_name, auth.info.last_name].join(' '),
          userpic: remote_userpic(auth.info.image)
        }
    end
  end
end
