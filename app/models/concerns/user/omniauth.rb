module User::Omniauth
  extend ActiveSupport::Concern

  def add_data_from_facebook(auth)
    profile.userpic = URI.parse(auth.info.image).open if profile.userpic.blank?
    assign_attributes(provider: auth.provider, uid: auth.uid)
  end

  class_methods do
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
          userpic: (URI.parse(auth.info.image).open if auth.info.image.present?)
        }
    end
  end
end
