require 'test_helper'

class Api::V1::Tournaments::QualificationResults::JumpRangesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:qualification_loen)
    @jump = qualification_jumps(:qualification_jump_1)
    @jump.update_columns(
      competitor_id: tournament_competitors(:qualification_competitor).id,
      track_id: create_track_from_file('loen_jump_one_08-02-19.CSV').id
    )
  end

  test '#update sets the start time and scores the jump' do
    patch api_v1_tournament_qualification_result_jump_range_path(@tournament, @jump),
          params: { jump_range: { start_time: '2017-06-05T08:03:17.400Z', canopy_time: 42.5 } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    body = response.parsed_body
    assert_in_delta 34.716, body['result']
    assert_equal '2017-06-05T08:03:17.400Z', body['startTime']
    assert_in_delta 42.5, body['canopyTime']
    assert_equal @jump.track_id, body['trackId']
    assert_not_nil body['detectedStartTime']
  end

  test '#update changes the track jump range' do
    patch api_v1_tournament_qualification_result_jump_range_path(@tournament, @jump),
          params: { jump_range: { ff_start: 10, ff_end: 60, landing_fl_time: nil } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal 10, response.parsed_body['ffStart']
    assert_equal 60, response.parsed_body['ffEnd']
    assert_equal '10;60', @jump.track.reload.jump_range
  end

  test '#update is forbidden for non organizers' do
    patch api_v1_tournament_qualification_result_jump_range_path(@tournament, @jump),
          params: { jump_range: { result: 1 } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end

  test '#update requires a track' do
    @jump.update_column(:track_id, nil)

    patch api_v1_tournament_qualification_result_jump_range_path(@tournament, @jump),
          params: { jump_range: { result: 30 } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end
end
