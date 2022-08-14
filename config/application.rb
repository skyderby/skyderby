require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
require 'action_cable/engine'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Skyderby
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    config.load_defaults Rails::VERSION::STRING.to_f

    config.track_scanner = config_for(:track_scanner)

    # The default locale is :en and all translations from config/locales/**/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config/locales/**/*.{rb,yml}').to_s]
    config.i18n.available_locales = [:en, :ru, :de, :es, :fr, :it]
    config.i18n.default_locale = :en

    config.autoload_paths << Rails.root.join('lib')

    config.action_controller.always_permitted_parameters = %w[controller action locale]
  end
end
