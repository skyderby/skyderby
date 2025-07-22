require 'test_helper'

class Events::Rounds::MapsControllerTest < ActionDispatch::IntegrationTest
  test '#show' do
    event = events(:nationals)
    round = event_rounds(:distance_1)

    get performance_competition_round_map_path(performance_competition_id: event.id, round_id: round.id)

    assert_response :success
  end
end
