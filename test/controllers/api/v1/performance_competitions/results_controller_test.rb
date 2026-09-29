require 'test_helper'

class Api::V1::PerformanceCompetitions::ResultsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
    @result = event_results(:john_distance_1)
  end

  test '#show returns result details' do
    get api_v1_performance_competition_result_path(@event, @result)

    assert_response :success
    body = response.parsed_body
    assert_equal @result.id, body['id']
    assert_equal 'distance', body.dig('round', 'discipline')
    assert_equal 'John', body.dig('competitor', 'name')
    assert_equal 'Advanced', body.dig('category', 'name')
    assert_in_delta 3000.0, body['result']
    assert_in_delta 2900.0, body['resultNet']
    assert_equal tracks(:hellesylt).id, body['trackId']
    assert_equal "/api/v1/tracks/#{tracks(:hellesylt).id}/point_series", body['pointSeriesPath']
  end

  test '#show hides results of uncompleted rounds' do
    event_rounds(:distance_1).update_column(:completed_at, nil)

    get api_v1_performance_competition_result_path(@event, @result)

    assert_response :not_found
  end
end
