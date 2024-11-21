return unless Rails.env.development?

Rails.application.config.after_initialize do
  require 'i18n-js/listen'
  I18nJS.listen
end
