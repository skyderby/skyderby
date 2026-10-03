require 'test_helper'

class Api::V1::PerformanceCompetitions::Results::ValidationsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @result = event_results(:john_distance_1)
  end

  test '#update toggles validation' do
    patch api_v1_performance_competition_result_validation_path(@event, @result),
          params: { result: { validated: true } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert response.parsed_body['validated']
    assert_predicate @result.reload, :validated?

    patch api_v1_performance_competition_result_validation_path(@event, @result),
          params: { result: { validated: false } },
          headers: bearer(:event_responsible_write)

    assert_not response.parsed_body['validated']
  end

  test '#update is forbidden for non editors' do
    patch api_v1_performance_competition_result_validation_path(@event, @result),
          params: { result: { validated: true } },
          headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
