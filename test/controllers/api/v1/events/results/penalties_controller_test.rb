require 'test_helper'

class Api::V1::Events::Results::PenaltiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:published_public)
    @result = event_results(:distance_competitor_1)
    @user = users(:event_responsible)
  end

  test '#update - when authorized' do
    sign_in @user

    put api_v1_event_result_penalty_url(@event.id, @result.id), params: {
      penalty: {
        penalized: true,
        penaltySize: 20,
        penaltyReason: 'Reason'
      }
    }

    @result.reload

    assert_response :success
    assert @result.penalized
    assert_equal 20, @result.penalty_size
    assert_equal 'Reason', @result.penalty_reason
  end

  test '#update - when not authorized' do
    put api_v1_event_result_penalty_url(@event.id, @result.id), params: {
      penalty: {
        penalized: true,
        penaltySize: 20,
        penaltyReason: 'Reason'
      }
    }

    assert_response :forbidden
  end
end
