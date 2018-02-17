module Internationalization
  extend ActiveSupport::Concern

  included do
    before_action :process_locale_param
    before_action :set_locale
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
end
