require 'test_helper'

class Events::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show, format: :html' do
    event = events(:nationals)

    get performance_competition_scoreboard_path(performance_competition_id: event.id)

    assert_response :redirect
    assert_redirected_to performance_competition_url(event)
  end
end
