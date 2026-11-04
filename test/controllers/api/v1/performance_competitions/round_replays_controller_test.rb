require 'test_helper'

class Api::V1::PerformanceCompetitions::RoundReplaysControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @round = event_rounds(:distance_1)
    @result = event_results(:john_distance_1)
    @result.update_column(:exited_at, Time.zone.parse('2018-01-01T12:00:00Z'))
  end

  test '#show groups jumps of a completed round' do
    get api_v1_performance_competition_round_replay_path(@event, @round)

    assert_response :success
    body = response.parsed_body
    assert body['available']
    jump = body['groups'].first.first
    assert_equal @result.id, jump['resultId']
    assert_equal @result.track_id, jump['trackId']
    assert_equal({ 'from' => @event.range_from, 'to' => @event.range_to }, body['window'])
  end

  test '#show hides uncompleted rounds from viewers' do
    @round.update_column(:completed_at, nil)

    get api_v1_performance_competition_round_replay_path(@event, @round)

    assert_not response.parsed_body['available']
    assert_empty response.parsed_body['groups']
  end

  test '#show lets organizers replay uncompleted rounds' do
    @round.update_column(:completed_at, nil)

    get api_v1_performance_competition_round_replay_path(@event, @round), headers: bearer(:event_responsible_write)

    assert response.parsed_body['available']
  end
end
