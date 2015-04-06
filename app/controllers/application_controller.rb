class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_locale
  before_filter :configure_permitted_parameters, if: :devise_controller?

  def self.default_url_options(options={})
    { locale: I18n.locale }
  end

  def after_sign_in_path_for(resource)
    request.referrer
  end

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_path, :alert => exception.message
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) << :name
  end

  private

  def set_locale
      I18n.locale = params[:locale] || I18n.default_locale
  end
end
