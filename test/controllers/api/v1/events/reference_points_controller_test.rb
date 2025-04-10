require 'test_helper'

class Api::V1::Events::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  test 'happy path' do
    event = performance_competitions(:nationals)
    event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
    event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

    get api_v1_event_reference_points_path(event_id: event.id), as: :json

    assert_response :success

    response_data = response.parsed_body
    assert_equal %w[R1 R2], response_data.pluck('name')
    assert_equal ['20.0', '30.0'], response_data.pluck('latitude')
    assert_equal ['25.0', '35.0'], response_data.pluck('longitude')
  end

  test 'permissions required' do
    event = performance_competitions(:nationals)
    event.draft!
    event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
    event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

    get api_v1_event_reference_points_path(event_id: event.id), as: :json

    assert_response :forbidden
  end
end
