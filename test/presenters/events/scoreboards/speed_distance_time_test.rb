require 'test_helper'

class Events::Scoreboards::SpeedDistanceTimeTest < ActiveSupport::TestCase
  test '#sections' do
    event = events(:nationals)
    params = Events::Scoreboards::Params.new(event, {})

    scoreboard = Events::Scoreboards.for(event, params)

    sections = scoreboard.sections.map(&:name)
    assert_equal %w[Advanced Intermediate], sections
  end
end
