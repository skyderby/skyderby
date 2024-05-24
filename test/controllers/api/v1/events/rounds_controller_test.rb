require 'test_helper'

class Api::V1::Events::RoundsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    get api_v1_event_rounds_url(events(:published_public))

    assert_response :success

    response_json = JSON.parse(response.body)

    expected_response = JSON.parse([
      { id: 1, discipline: 'distance', number: 1 },
      { id: 2, discipline: 'speed', number: 1 }
    ].to_json)

    assert_equal response_json, expected_response
  end
end
