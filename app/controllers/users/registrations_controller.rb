class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  def create
    if params.dig(:user, :profile_attributes, :last_name).present?
      redirect_to root_path
      return
    end

    super
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [{ profile_attributes: [:name, :last_name] }])
  end
end
