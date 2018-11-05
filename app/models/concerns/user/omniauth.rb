module User::Omniauth
  extend ActiveSupport::Concern

  def add_data_from_facebook(auth)
    profile.userpic = URI.parse(auth.info.image).open unless profile.userpic.present?
    self.provider = auth.provider
    self.uid = auth.uid
  end

  class_methods do
    def from_omniauth(auth)
      user = where(provider: auth.provider, uid: auth.uid).first_or_initialize do |user|
        user.email = auth.info.email
        user.password = Devise.friendly_token[0, 20]
        user.skip_confirmation!
      end
      return user if user.persisted?
      user.profile.first_name = auth.info.first_name
      user.profile.last_name = auth.info.last_name
      user.profile.name = [auth.info.first_name, auth.info.last_name].join(' ')
      user.profile.userpic = URI.parse(auth.info.image).open
      user.profile.save
      user
    end
  end
end
