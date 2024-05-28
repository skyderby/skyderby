require 'test_helper'

class Api::V1::Events::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  test '#index - happy path' do
    event = events(:nationals)
    event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
    event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

    get api_v1_event_reference_points_url(event_id: event.id)

    assert_response :success

    response_data = JSON.parse(response.body)
    assert_equal(%w[R1 R2], response_data.map { |el| el['name'] })
    assert_equal(['20.0', '30.0'], response_data.map { |el| el['latitude'] })
    assert_equal(['25.0', '35.0'], response_data.map { |el| el['longitude'] })
  end

  test '#index - permissions required' do
    event = events(:nationals)
    event.draft!
    event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
    event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

    get api_v1_event_reference_points_url(event_id: event.id)

    assert_response :forbidden
  end
end
