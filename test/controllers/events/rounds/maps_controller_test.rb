require 'test_helper'

class Events::Rounds::MapsControllerTest < ActionDispatch::IntegrationTest
  test '#show' do
    event = performance_competitions(:nationals)
    round = event_rounds(:distance_1)

    get event_round_map_path(event_id: event.id, round_id: round.id)

    assert_response :success
  end
end
