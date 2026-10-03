require 'test_helper'

class Api::V1::PerformanceCompetitions::Results::PenaltiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @result = event_results(:john_distance_1)
  end

  test '#update applies a penalty' do
    patch api_v1_performance_competition_result_penalty_path(@event, @result),
          params: { penalty: { penalized: true, penalty_size: 20, penalty_reason: 'Lane' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    body = response.parsed_body
    assert body['penalized']
    assert_equal 20, body['penaltySize']
    assert_equal 'Lane', body['penaltyReason']
  end

  test '#update is forbidden for non editors' do
    patch api_v1_performance_competition_result_penalty_path(@event, @result),
          params: { penalty: { penalized: true, penalty_size: 20 } },
          headers: bearer(:regular_user_write)

    assert_response :forbidden
    assert_not @result.reload.penalized?
  end
end
