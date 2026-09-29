require 'test_helper'

class Api::V1::PerformanceCompetitions::OpenScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show ranks every competitor in one group' do
    get api_v1_performance_competition_open_scoreboard_path(events(:nationals))

    assert_response :success
    body = response.parsed_body
    assert_equal 'open', body['board']
    assert_equal 1, body['groups'].size
    assert_nil body['groups'].first['category']
    assert_equal [183.3, 174.1, 0.0], body['groups'].first['rows'].pluck('totalPoints')
  end
end
