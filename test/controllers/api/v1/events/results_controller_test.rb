require 'test_helper'

class Api::V1::Events::ResultsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    event = events(:nationals)

    get api_v1_event_results_path(event_id: event.id), as: :json

    response_json = response.parsed_body
    result_numbers = response_json.pluck('result')
    rounds = response_json.pluck('round_name')

    assert_response :success
    assert_equal ['3000.0', '250.0', '2500.0', '270.0'], result_numbers
    assert_equal %w[Distance-1 Speed-1 Distance-1 Speed-1], rounds
  end

  test '#create when not allowed' do
    event = events(:nationals)
    post api_v1_event_results_path(event_id: event.id), as: :json

    assert_response :forbidden
  end

  test '#create when allowed, with correct data' do
    sign_in users(:event_responsible)

    event = events(:nationals)
    round = event.rounds.create!(discipline: :distance)
    competitor = event_competitors(:john)

    event.reference_points.create!(name: 'Lane 1', latitude: 20, longitude: 20)

    params = {
      event_id: event.id,
      competitor_name: competitor.name,
      round_name: 'Distance-2',
      penalized: 'true',
      penalty_size: 10,
      reference_point: {
        name: 'Lane 1',
        latitude: '40.0',
        longitude: '40.0'
      },
      jump_range: {
        exit_time: '2018-02-24T15:23:44.40Z',
        deploy_time: '2018-02-24T15:26:24.40Z'
      },
      track_attributes: {
        file: fixture_file_upload('tracks/distance_2454.csv', 'text/csv')
      }
    }

    post api_v1_event_results_path(event_id: event.id), params: params

    assert_response :success

    response_json = response.parsed_body

    result = event.results.last
    assert_equal response_json['id'], result.id
    assert result.penalized

    track = result.track
    assert_equal 2405, track.ff_start
    assert_equal 2565, track.ff_end

    assert_not round.reference_point_assignments.where(competitor: competitor).blank?
    assert_equal 2, event.reference_points.count
  end
end
