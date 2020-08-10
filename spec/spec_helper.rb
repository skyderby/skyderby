if ENV['ENABLE_COVERAGE']
  require 'simplecov'
  SimpleCov.start do
    add_filter '/vendor/'
  end
end

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../config/environment', __dir__)
require 'rspec/rails'
require 'capybara/rspec'

ActiveRecord::Migration.maintain_test_schema!

Capybara.ignore_hidden_elements = true
Capybara.default_max_wait_time = 5
Capybara.asset_host = 'http://localhost:3000'

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

I18n.locale = :en

RSpec.configure do |config|
  config.include ActiveSupport::Testing::TimeHelpers
  config.include FactoryBot::Syntax::Methods
  config.include Features::UploadHelpers
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :system
  config.include Select2Helper, type: :system
  config.include CreateTrackHelper

  config.infer_spec_type_from_file_location!

  config.fixture_path = Rails.root.join('spec/fixtures')
  config.global_fixtures = :all
  config.use_transactional_fixtures = true

  config.before(:each, type: :system) do
    I18n.locale = :en

    driven_by :rack_test
    default_url_options[:locale] = :en
  end

  config.before(:each, type: :system, js: true) do
    if ENV['SELENIUM_HEADLESS_CHROME'].present?
      driven_by :selenium_chrome_headless
    else
      driven_by :selenium_chrome
    end
  end

  config.after(:each, type: :system) do
    default_url_options.delete(:locale)
  end

  config.order = :random

  Kernel.srand config.seed
end
