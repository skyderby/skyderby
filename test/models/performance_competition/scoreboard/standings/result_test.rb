require 'test_helper'

class PerformanceCompetition::Scoreboard::Standings::ResultTest < ActiveSupport::TestCase
  setup do
    @event = events(:nationals)
    @penalized_result = event_results(:john_speed_1).tap do |record|
      record.update_columns(result: 250, result_net: 240, penalty_size: 20, penalized: true)
      record.reload
    end

    @regular_result = event_results(:travis_speed_1).tap do |record|
      record.update_columns(result: 270, result_net: 265, penalty_size: nil, penalized: false)
      record.reload
    end
  end

  test 'applies penalty to result when apply_penalty_to_score is false' do
    @event.update!(apply_penalty_to_score: false)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(@penalized_result)

    # john_speed_1: result=250, penalty_size=20 -> 250 - (250 * 0.20) = 200
    assert_in_delta 200.0, standings_result.result, 0.01
  end

  test 'does not apply penalty to result when apply_penalty_to_score is true' do
    @event.update!(apply_penalty_to_score: true)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(@penalized_result)

    # john_speed_1: result=250, no penalty applied to result
    assert_equal 250.0, standings_result.result
  end

  test 'applies penalty to points when apply_penalty_to_score is true' do
    @event.update!(apply_penalty_to_score: true)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(@penalized_result)
    best_result = 300.0

    standings_result.calculate_points_from(best_result)

    # john_speed_1: result=250, best_result=300 -> (250/300)*100 = 83.33, penalty 20% -> 83.33 - 16.67 = 66.67
    assert_in_delta 66.67, standings_result.points, 0.01
  end

  test 'does not apply penalty to points when apply_penalty_to_score is false' do
    @event.update!(apply_penalty_to_score: false)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(@penalized_result)
    best_result = 300.0

    standings_result.calculate_points_from(best_result)

    # Result is already penalized: 200 (penalized result) -> (200/300)*100 = 66.67
    assert_in_delta 66.67, standings_result.points, 0.01
  end

  test 'does not apply penalty to points when penalty_size is nil' do
    @event.update!(apply_penalty_to_score: true)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(@regular_result)
    best_result = 300.0

    standings_result.calculate_points_from(best_result)

    # travis_speed_1: result=270, no penalty -> (270/300)*100 = 90.0
    assert_in_delta 90.0, standings_result.points, 0.01
  end

  test 'applies penalty to result with wind cancellation when apply_penalty_to_score is false' do
    @event.update!(apply_penalty_to_score: false)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(
      @penalized_result, wind_cancellation: true
    )

    # john_speed_1: result_net=240, penalty_size=20 -> 240 - (240 * 0.20) = 192
    assert_in_delta 192.0, standings_result.result, 0.01
  end

  test 'does not apply penalty to result with wind cancellation when apply_penalty_to_score is true' do
    @event.update!(apply_penalty_to_score: true)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(
      @penalized_result, wind_cancellation: true
    )

    # john_speed_1: result_net=240, no penalty applied to result
    assert_equal 240.0, standings_result.result
  end

  test 'applies penalty to points with wind cancellation when apply_penalty_to_score is true' do
    @event.update!(apply_penalty_to_score: true)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(
      @penalized_result, wind_cancellation: true
    )
    best_result = 300.0

    standings_result.calculate_points_from(best_result)

    # john_speed_1: result_net=240, best_result=300 -> (240/300)*100 = 80.0, penalty 20% -> 80.0 - 16.0 = 64.0
    assert_in_delta 64.0, standings_result.points, 0.01
  end

  test 'does not apply penalty to points with wind cancellation when apply_penalty_to_score is false' do
    @event.update!(apply_penalty_to_score: false)
    standings_result = PerformanceCompetition::Scoreboard::Standings::Result.new(
      @penalized_result, wind_cancellation: true
    )
    best_result = 300.0

    standings_result.calculate_points_from(best_result)

    # Result_net is already penalized: 192 (penalized result_net) -> (192/300)*100 = 64.0
    assert_in_delta 64.0, standings_result.points, 0.01
  end
end
