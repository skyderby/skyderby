require 'test_helper'

Capybara.ignore_hidden_elements = true
Capybara.default_max_wait_time = 5

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  include FactoryBot::Syntax::Methods
  include Devise::Test::IntegrationHelpers
  include ActionDispatch::TestProcess
  include ActiveJob::TestHelper
  include Select2Helper
  include HotSelectHelper

  headless = ENV['SELENIUM_HEADLESS_CHROME'].present?
  browser = headless ? :headless_chrome : :chrome
  driven_by :selenium, using: browser do |options|
    options.add_preference('intl.accept_languages', 'en-US')
    options.add_argument("--window-position=#{ENV.fetch('CHROME_WINDOW_POSITION', '0,0')}") unless headless
  end

  setup do
    ActionMailer::Base.deliveries.clear
  end
end
