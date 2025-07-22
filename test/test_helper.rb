ENV['RAILS_ENV'] ||= 'test'
ENV['NODE_ENV'] ||= 'production'
require_relative '../config/environment'
require 'rails/test_help'
require 'vcr'

ActiveRecord::Migration.maintain_test_schema!

Rails.root.glob('test/support/**/*.rb').each { |f| require f }

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

    set_fixture_class 'event/competitors' => PerformanceCompetition::Competitor
    set_fixture_class 'event/results' => PerformanceCompetition::Result
    set_fixture_class 'event/rounds' => PerformanceCompetition::Round
    set_fixture_class 'event/sections' => PerformanceCompetition::Category
    set_fixture_class 'events' => PerformanceCompetition

    fixtures :all

    def run
      I18n.with_locale(:en) do
        super
      end
    end
  end
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end
