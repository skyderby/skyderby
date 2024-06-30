ENV['RAILS_ENV'] ||= 'test'
ENV['NODE_ENV'] ||= 'production'
require_relative '../config/environment'
require 'rails/test_help'
require 'vcr'

ActiveRecord::Migration.maintain_test_schema!

Dir[Rails.root.join('test/support/**/*.rb')].each { |f| require f }

I18n.locale = :en

VCR.configure do |config|
  config.cassette_library_dir = 'test/cassettes'
  config.hook_into :webmock
  config.ignore_localhost = true
end

module ActiveSupport
  class TestCase
    include FactoryBot::Syntax::Methods
    include ActionDispatch::TestProcess
    include CreateTrackHelper

    fixtures :all
  end
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end

# RSpec.configure do |config|
#   config.include ActiveSupport::Testing::TimeHelpers
#   config.include ActiveJob::TestHelper
#   config.include Features::UploadHelpers
#   config.include Devise::Test::ControllerHelpers, type: :controller
#   config.include Devise::Test::IntegrationHelpers, type: :request
#   config.include Devise::Test::IntegrationHelpers, type: :system
#
#   config.infer_spec_type_from_file_location!
#
#   config.fixture_path = Rails.root.join('spec/fixtures')
#   config.global_fixtures = :all
#   config.use_transactional_fixtures = true
#
#   config.prepend_before(:each, type: :system) do
#     headless = ENV['SELENIUM_HEADLESS_CHROME'].present?
#     browser = headless ? :headless_chrome : :chrome
#
#     driven_by :selenium, using: browser do |options|
#       options.add_option('prefs', 'intl.accept_languages' => 'en-US')
#     end
#   end
#
#   config.order = :random
#   Kernel.srand config.seed
# end
