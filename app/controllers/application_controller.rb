class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_locale
  before_action :store_current_location, unless: :devise_controller?
  before_filter :configure_permitted_parameters, if: :devise_controller?

  def self.default_url_options(options={})
    { locale: I18n.locale }
  end

  def after_sign_in_path_for(resource)
    stored_location_for(:user) || root_path
  end

  rescue_from CanCan::AccessDenied do |exception|
    request.format.html? ? redirect_to(root_path, alert: exception.message) : raise(exception)
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) << :name
  end

  def store_current_location
    store_location_for(:user, request.url)
  end

  private

  def set_locale
    I18n.locale = params[:locale] || 
      http_accept_language.compatible_language_from(I18n.available_locales) ||
      I18n.default_locale
  end
end
