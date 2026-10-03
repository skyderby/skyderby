require 'test_helper'

class Api::V1::PerformanceCompetitions::ReferencePointsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create without attributes places a point at the event place' do
    post api_v1_performance_competition_reference_points_path(@event), headers: bearer(:event_responsible_write)

    assert_response :created
    body = response.parsed_body
    assert_equal 'R1', body['name']
    assert_in_delta places(:ravenna).latitude.to_f, body['latitude']
  end

  test '#create with attributes' do
    post api_v1_performance_competition_reference_points_path(@event),
         params: { reference_point: { name: 'Exit A', latitude: 44.1, longitude: 12.2 } },
         headers: bearer(:event_responsible_write)

    assert_response :created
    assert_equal 'Exit A', response.parsed_body['name']
    assert_in_delta 44.1, response.parsed_body['latitude']
  end

  test '#update and #destroy' do
    point = @event.reference_points.create!(name: 'R1', latitude: 1, longitude: 2)

    patch api_v1_performance_competition_reference_point_path(@event, point),
          params: { reference_point: { name: 'R9' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 'R9', point.reload.name

    delete api_v1_performance_competition_reference_point_path(@event, point), headers: bearer(:event_responsible_write)

    assert_response :no_content
  end

  test '#update refuses a point assigned to competitors' do
    point = @event.reference_points.create!(name: 'R1', latitude: 1, longitude: 2)
    event_rounds(:distance_1).reference_point_assignments.create!(competitor: event_competitors(:john),
                                                                  reference_point: point)

    patch api_v1_performance_competition_reference_point_path(@event, point),
          params: { reference_point: { name: 'R9' } },
          headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_reference_points_path(@event), headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
