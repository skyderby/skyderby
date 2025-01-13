require 'test_helper'

class Events::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show, format: :html' do
    event = events(:nationals)

    get event_scoreboard_path(event_id: event.id)

    assert_response :redirect
    assert_redirected_to event_url(event)
  end
end
