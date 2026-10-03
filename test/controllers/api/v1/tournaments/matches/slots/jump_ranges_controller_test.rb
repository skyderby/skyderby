require 'test_helper'

class Api::V1::Tournaments::Matches::Slots::JumpRangesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:world_base_race)
    @tournament.finish_line.update!(
      start_latitude: 62.053858, start_longitude: 6.945123, end_latitude: 62.056071, end_longitude: 6.945568
    )
    @match = tournament_matches(:match_1)
    @slot = tournament_match_slots(:slot_1)
    @slot.update_column(:track_id, create_track_from_file('WBR/11-40-01_Ratmir.CSV').id)
  end

  test '#update sets the match start time and scores the slot' do
    patch api_v1_tournament_match_slot_jump_range_path(@tournament, @match, @slot),
          params: { jump_range: { start_time: '2015-07-02T11:45:38.185Z' } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_in_delta 33.543, response.parsed_body['result'], 0.001
    assert_equal '2015-07-02T11:45:38.185Z', response.parsed_body['startTime']
    assert_equal '2015-07-02T11:45:38.185Z', @match.reload.start_time.utc.iso8601(3)
  end

  test '#update changes the track jump range' do
    patch api_v1_tournament_match_slot_jump_range_path(@tournament, @match, @slot),
          params: { jump_range: { ff_start: 5, ff_end: 40 } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal '5;40', @slot.reload.track.jump_range
  end

  test '#update is forbidden for non organizers' do
    patch api_v1_tournament_match_slot_jump_range_path(@tournament, @match, @slot),
          params: { jump_range: { ff_start: 5, ff_end: 40 } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
