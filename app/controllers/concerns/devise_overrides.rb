module DeviseOverrides
  extend ActiveSupport::Concern

  included do
    before_action :store_current_location, unless: :devise_controller?
    before_action :configure_permitted_parameters, if: :devise_controller?
  end

  def current_user
    super || GuestUser.new(cookies)
  end

  def user_signed_in?
    current_user.registered?
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [{ profile_attributes: :name }])
  end

  def store_current_location
    store_location_for(:user, request.url) unless request.xhr?
  end

  def after_sign_in_path_for(_resource)
    stored_location_for(:user) || root_path
  end

  def after_sign_out_path_for(_resource)
    stored_location_for(:user) || root_path
  end
end
