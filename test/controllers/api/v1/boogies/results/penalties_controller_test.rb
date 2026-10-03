require 'test_helper'

class Api::V1::Boogies::Results::PenaltiesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @result = Boogie::Result.find(ActiveRecord::FixtureSet.identify(:boogie_john_1))
  end

  test '#update penalizes the result' do
    patch api_v1_boogie_result_penalty_path(@boogie, @result),
          params: { penalty: { penalized: true, penalty_size: 20, penalty_reason: 'Late exit' } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    body = response.parsed_body
    assert body['penalized']
    assert_equal 20, body['penaltySize']
    assert_equal 'Late exit', @result.reload.penalty_reason
  end

  test '#update is forbidden for non editors' do
    patch api_v1_boogie_result_penalty_path(@boogie, @result), params: { penalty: { penalized: true } },
                                                               headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert_not @result.reload.penalized
  end
end
