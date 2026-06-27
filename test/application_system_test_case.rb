require 'test_helper'

Capybara.ignore_hidden_elements = true
Capybara.default_max_wait_time = 5

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  include FactoryBot::Syntax::Methods
  include Devise::Test::IntegrationHelpers
  include ActionDispatch::TestProcess
  include ActiveJob::TestHelper
  include HotSelectHelper

  headless = ENV.fetch('SELENIUM_HEADLESS_CHROME', 'true') != 'false'
  browser = headless ? :headless_chrome : :chrome
  driven_by :selenium, using: browser, screen_size: [1400, 1400] do |options|
    options.add_preference('intl.accept_languages', 'en-US')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1400,1400')
    options.add_argument("--window-position=#{ENV.fetch('CHROME_WINDOW_POSITION', '0,0')}") unless headless
  end

  setup do
    ActionMailer::Base.deliveries.clear
  end
end
