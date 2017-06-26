require 'simplecov'
SimpleCov.start do
  # Ignores any file containing "/vendor/" in its path.
  add_filter '/vendor/'
end

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require 'capybara/rspec'
require 'capybara/poltergeist'

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, { js_errors: true })
end
Capybara.javascript_driver = :poltergeist
Capybara.ignore_hidden_elements = true
Capybara.default_max_wait_time = 10
Capybara.asset_host = 'http://localhost:3000'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods
  config.include Features::UploadHelpers

  config.include Devise::TestHelpers, type: :controller
  config.include ControllerHelpers, type: :controller

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  config.before(:each, type: :feature) do
    I18n.locale = :en
    default_url_options[:locale] = :en
  end

  config.order = :random

  Kernel.srand config.seed
end
