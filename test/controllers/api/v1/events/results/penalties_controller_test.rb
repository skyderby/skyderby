require 'test_helper'

class Api::V1::Events::Results::PenaltiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
  end

  test 'when authorized' do
    sign_in users(:event_responsible)

    result = event_results(:john_distance_1)

    put api_v1_event_result_penalty_path(event_id: @event.id, result_id: result.id), params: {
      penalty: {
        penalized: true,
        penaltySize: 20,
        penaltyReason: 'Reason'
      }
    }

    result.reload

    assert_response :success
    assert result.penalized
    assert_equal 20, result.penalty_size
    assert_equal 'Reason', result.penalty_reason
  end

  test 'when not authorized' do
    result = @event.results.first

    put api_v1_event_result_penalty_path(event_id: @event.id, result_id: result.id), params: {
      penalty: {
        penalized: true,
        penaltySize: 20,
        penaltyReason: 'Reason'
      }
    }

    assert_response :forbidden
  end
end
