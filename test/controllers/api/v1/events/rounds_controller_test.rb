require 'test_helper'

class Api::V1::Events::RoundsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    get api_v1_event_rounds_path(event_id: performance_competitions(:nationals).id), as: :json
    assert_response :success

    expected_response = [
      { id: event_rounds(:distance_1).id, discipline: 'distance', number: 1 },
      { id: event_rounds(:speed_1).id, discipline: 'speed', number: 1 }
    ]

    assert_equal expected_response.to_json, response.body
  end
end
