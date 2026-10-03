require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::Results::JumpRangesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = @event.upload_track(
      round: speed_skydiving_competition_rounds(:nationals_round_2),
      competitors: [speed_skydiving_competition_competitors(:hinton)],
      file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
    ).sole
  end

  test '#update changes the jump range and recalculates the result' do
    track = @result.track
    landed_at = track.landed_at

    patch api_v1_speed_skydiving_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 5.0, ff_end: 40.4 } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal @result.id, response.parsed_body['id']
    track.reload
    assert_equal [5, 40], [track.ff_start, track.ff_end]
    assert_equal landed_at, track.landed_at
  end

  test '#update clears the landing time with an explicit null' do
    patch api_v1_speed_skydiving_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 0, ff_end: 40, landing_fl_time: nil } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_nil @result.track.reload.landed_at
  end

  test '#update requires the range bounds' do
    patch api_v1_speed_skydiving_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 5 } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :bad_request
  end

  test '#update is forbidden for non-editors' do
    patch api_v1_speed_skydiving_competition_result_jump_range_path(@event, @result),
          params: { jump_range: { ff_start: 5, ff_end: 40 } }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
