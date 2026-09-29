require 'test_helper'

class Api::V1::PerformanceCompetitions::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#show computes standings per category' do
    get api_v1_performance_competition_scoreboard_path(@event)

    assert_response :success
    body = response.parsed_body
    assert_equal 'main', body['board']
    assert_not body['surprise']
    assert body['showDisciplinePoints']
    assert body['showRankChanges']
    assert_equal(%w[Advanced Intermediate], body['groups'].map { |group| group.dig('category', 'name') })

    rows = body['groups'].first['rows']
    assert_equal [event_competitors(:travis).id, event_competitors(:john).id, event_competitors(:alex).id],
                 rows.pluck('competitorId')
    assert_equal [1, 2, 3], rows.pluck('rank')
    assert_equal [183.3, 174.1, 0.0], rows.pluck('totalPoints')
    assert_equal [true, true, false], rows.pluck('onPodium')

    john = rows.second
    assert_equal 'John', john.dig('competitor', 'name')
    distance = john['results'].find { |result| result['id'] == event_results(:john_distance_1).id }
    assert_equal 'final', distance['status']
    assert_in_delta 3000.0, distance['result']
    assert_equal '3000', distance['formattedResult']
    assert_in_delta 100.0, distance['points']
    assert distance['best']
    assert_equal tracks(:hellesylt).id, distance['trackId']

    speed = john['results'].find { |result| result['id'] == event_results(:john_speed_1).id }
    assert_in_delta 200.0, speed['result']
    assert_in_delta 74.1, speed['points']
    assert_equal '-70.0', speed['formattedGapToBest']
    assert speed['penalized']
    assert_equal 20, speed['penaltySize']
    assert_equal 'Lane violation', speed['penaltyReason']
  end

  test '#show applies wind cancellation unless raw results are requested' do
    @event.update_column(:wind_cancellation, true)

    get api_v1_performance_competition_scoreboard_path(@event)
    body = response.parsed_body
    assert body.dig('windCancellation', 'applied')
    assert_equal [182.8, 172.5, 0.0], body['groups'].first['rows'].pluck('totalPoints')

    get api_v1_performance_competition_scoreboard_path(@event, including_wind: 1)
    body = response.parsed_body
    assert_not body.dig('windCancellation', 'applied')
    assert_equal [183.3, 174.1, 0.0], body['groups'].first['rows'].pluck('totalPoints')
  end

  test '#show hides results of uncompleted rounds from viewers' do
    event_rounds(:speed_1).update_column(:completed_at, nil)
    event_results(:john_speed_1).update_column(:validated_at, Time.zone.now)

    get api_v1_performance_competition_scoreboard_path(@event)
    results = response.parsed_body['groups'].first['rows'].flat_map { |row| row['results'] }
    speed_results = results.select { |result| result['roundId'] == event_rounds(:speed_1).id }
    assert_equal [event_results(:john_speed_1).id], speed_results.pluck('id')
    assert_equal 'validated', speed_results.first['status']
    assert_nil speed_results.first['points']

    get api_v1_performance_competition_scoreboard_path(@event), headers: bearer(:event_responsible_write)
    results = response.parsed_body['groups'].first['rows'].flat_map { |row| row['results'] }
    speed_results = results.select { |result| result['roundId'] == event_rounds(:speed_1).id }
    assert_equal %w[provisional provisional], speed_results.pluck('status')
  end

  test '#show rewinds standings with until_round' do
    get api_v1_performance_competition_scoreboard_path(@event, until_round: 1)

    body = response.parsed_body
    assert body['timeMachine']
    assert_equal 1, body['untilRound']
    assert_equal 2, body['timeline'].size
    first_round_id = body['timeline'].first['roundId']
    results = body['groups'].first['rows'].flat_map { |row| row['results'] }
    assert_equal [first_round_id], results.pluck('roundId').uniq
  end

  test '#show hides standings of a surprise event' do
    @event.update_column(:status, :surprise)

    get api_v1_performance_competition_scoreboard_path(@event)

    assert_response :success
    assert response.parsed_body['surprise']
    assert_empty response.parsed_body['groups']
  end

  test '#show returns not found for drafts' do
    @event.update_column(:status, :draft)

    get api_v1_performance_competition_scoreboard_path(@event)

    assert_response :not_found
  end
end
