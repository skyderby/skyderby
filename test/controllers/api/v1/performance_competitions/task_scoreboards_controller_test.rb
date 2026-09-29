require 'test_helper'

class Api::V1::PerformanceCompetitions::TaskScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show ranks competitors within one discipline' do
    get api_v1_performance_competition_task_scoreboard_path(events(:nationals), 'distance')

    assert_response :success
    body = response.parsed_body
    assert_equal 'task', body['board']
    assert_equal 'distance', body['task']
    assert_not body['showDisciplinePoints']
    assert_equal ['distance'], body['disciplines'].pluck('discipline')
    rows = body['groups'].first['rows']
    assert_equal [event_competitors(:john).id, event_competitors(:travis).id], rows.first(2).pluck('competitorId')
    assert_equal [100.0, 83.3], rows.first(2).pluck('totalPoints')
  end

  test '#show returns not found for a discipline without rounds' do
    get api_v1_performance_competition_task_scoreboard_path(events(:nationals), 'time')

    assert_response :not_found
  end
end
