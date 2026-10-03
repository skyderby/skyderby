require 'test_helper'

class Api::V1::Boogies::Results::JumpRangesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @result = Boogie::Result.find(ActiveRecord::FixtureSet.identify(:boogie_john_1))
  end

  test '#update changes the jump range and recalculates' do
    previous_updated_at = @boogie.updated_at

    patch api_v1_boogie_result_jump_range_path(@boogie, @result),
          params: { jump_range: { ff_start: 5.0, ff_end: 40.0 } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    track = @result.reload.track
    assert_equal 5, track.ff_start
    assert_equal 40, track.ff_end
    assert_operator @boogie.reload.updated_at, :>, previous_updated_at
  end

  test '#update requires both ends of the range' do
    patch api_v1_boogie_result_jump_range_path(@boogie, @result), params: { jump_range: { ff_start: 5.0 } },
                                                                  headers: bearer(:event_responsible_write), as: :json

    assert_response :bad_request
  end

  test '#update is forbidden for non editors' do
    patch api_v1_boogie_result_jump_range_path(@boogie, @result),
          params: { jump_range: { ff_start: 5.0, ff_end: 40.0 } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
