require 'test_helper'

class Events::ScoreboardsTest < ActiveSupport::TestCase
  test 'raise error on unsupported scoreboard' do
    event = create :event
    event.update!(rules: nil)
    params = Events::Scoreboards::Params.new(event, {})

    assert_raises(NotImplementedError, 'Scoreboard for nil is not defined') do
      Events::Scoreboards.for(event, params)
    end
  end
end
