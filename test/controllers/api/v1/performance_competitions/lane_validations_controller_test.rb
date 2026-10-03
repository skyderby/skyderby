require 'test_helper'

class Api::V1::PerformanceCompetitions::LaneValidationsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @round = event_rounds(:distance_1)
    base = Time.zone.parse('2018-01-01 12:00:00')
    event_results(:john_distance_1).update_columns(exited_at: base, exit_altitude: 3300.4)
    event_results(:travis_distance_1).update_columns(exited_at: base + 5.minutes, exit_altitude: 3250)
    @point = @event.reference_points.create!(name: 'R1', latitude: 1, longitude: 2)
    @round.reference_point_assignments.create!(competitor: event_competitors(:john), reference_point: @point)
  end

  test '#show groups jumps by exit time' do
    get api_v1_performance_competition_lane_validation_path(@event, @round), headers: bearer(:event_responsible_write)

    assert_response :success
    body = response.parsed_body
    assert_equal @round.id, body.dig('round', 'id')
    assert body['available']
    assert_not body['judgeable']
    assert_equal @event.designated_lane_start, body.dig('event', 'designatedLaneStart')
    assert_equal 3000, body.dig('event', 'rangeFrom')
    assert_equal ['R1'], body['referencePoints'].pluck('name')
    assert_equal [1, 2], body['groups'].pluck('number')

    jump = body['groups'].first['jumps'].first
    assert_equal event_results(:john_distance_1).id, jump['resultId']
    assert_equal 'John', jump.dig('competitor', 'name')
    assert_equal @point.id, jump['referencePointId']
    assert_equal 3300, jump['exitAltitude']
    assert_equal '2018-01-01T12:00:00.000Z', jump['exitedAt']
    assert_equal tracks(:hellesylt).id, jump['trackId']
  end

  test '#show hides jumps of uncompleted rounds from non editors' do
    @round.update_column(:completed_at, nil)

    get api_v1_performance_competition_lane_validation_path(@event, @round), headers: bearer(:regular_user_read)

    assert_response :success
    assert_not response.parsed_body['available']
    assert_empty response.parsed_body['groups']
  end

  test '#show shows completed rounds to viewers' do
    get api_v1_performance_competition_lane_validation_path(@event, @round), headers: bearer(:regular_user_read)

    assert_response :success
    assert response.parsed_body['available']
    assert_not response.parsed_body['editable']
  end

  test '#show requires authentication' do
    get api_v1_performance_competition_lane_validation_path(@event, @round)

    assert_response :unauthorized
  end
end
