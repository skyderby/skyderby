class ApplicationController < ActionController::Base
  include Pundit
  include MobileFormatOverride

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception, prepend: true
  before_action :process_locale_param
  before_action :set_locale
  before_action :mini_profiler

  before_action :store_current_location, unless: :devise_controller?
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from CanCan::AccessDenied, Pundit::NotAuthorizedError do |exception|
    raise(exception) unless request.format.html?
    redirect_to(root_path, alert: 'You are not authorized to access this page.', status: 403)
  end

  def masquerading?
    session[:admin_id].present?
  end
  helper_method :masquerading?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
  end

  def store_current_location
    store_location_for(:user, request.url) unless request.xhr?
  end

  private

  def after_sign_in_path_for(_resource)
    stored_location_for(:user) || root_path
  end

  def after_sign_out_path_for(_resource)
    stored_location_for(:user) || root_path
  end

  def set_locale
    I18n.locale =
      user_locale ||
      http_accept_language.compatible_language_from(I18n.available_locales) ||
      I18n.default_locale
  end

  def process_locale_param
    locale_param = params.delete(:locale).to_s.first(2)
    locale = I18n.available_locales.detect { |x| x.to_s == locale_param }
    cookies[:locale] = locale if locale
  end

  def user_locale
    cookies[:locale]
  end

  def mini_profiler
    Rack::MiniProfiler.authorize_request if current_user&.has_role? :admin
  end
end
