class Users::SessionsController < Devise::SessionsController
  rate_limit to: 10, within: 3.minutes, only: :create, with: :rate_limit_exceeded

  def create
    self.resource = warden.authenticate(auth_options)

    if resource
      set_flash_message!(:notice, :signed_in)
      sign_in(resource_name, resource)
      Amplitude.identify(user_id: resource.id, properties: { plan: resource.subscription_plan })
      respond_with resource, location: after_sign_in_path_for(resource)
    else
      self.resource = resource_class.new(sign_in_params)
      flash.now[:alert] = I18n.t('devise.failure.invalid', authentication_keys: 'Email')
      render :new, status: :unprocessable_content
    end
  end
end
