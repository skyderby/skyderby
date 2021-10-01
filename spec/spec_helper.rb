ENV['RAILS_ENV'] ||= 'test'
ENV['NODE_ENV'] ||= 'production'
require File.expand_path('../config/environment', __dir__)
require 'rspec/rails'
require 'capybara/rspec'

ActiveRecord::Migration.maintain_test_schema!

NEXT_PORT = 4001

Capybara.ignore_hidden_elements = true
Capybara.default_max_wait_time = 5
Capybara.app_host = "http://localhost:#{NEXT_PORT}"
Capybara.server_port = 33_001

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

I18n.locale = :en

RSpec.configure do |config|
  config.include ActiveSupport::Testing::TimeHelpers
  config.include ActiveJob::TestHelper
  config.include FactoryBot::Syntax::Methods
  config.include Features::UploadHelpers
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include Devise::Test::IntegrationHelpers, type: :system
  config.include CreateTrackHelper

  config.infer_spec_type_from_file_location!

  config.fixture_path = Rails.root.join('spec/fixtures')
  config.global_fixtures = :all
  config.use_transactional_fixtures = true

  config.order = :random
  Kernel.srand config.seed

  config.prepend_before(:each, type: :system) do
    headless = ENV['SELENIUM_HEADLESS_CHROME'].present?
    browser = headless ? :headless_chrome : :chrome

    driven_by :selenium, using: browser do |options|
      options.add_option('prefs', 'intl.accept_languages' => 'en-US')
    end
  end

  config.before(:suite) { NextServer.start }
  config.after(:suite) { NextServer.stop }
end
