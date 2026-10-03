require 'test_helper'

class Api::V1::Tournaments::Matches::Slots::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:world_base_race)
    @match = tournament_matches(:match_1)
    @match.update!(start_time: '2015-07-02 11:45:38.185')
    @slot = tournament_match_slots(:slot_1)
  end

  test '#create uploads a track file and scores the slot' do
    params = { result: { file: fixture_file_upload('tracks/WBR/11-40-01_Ratmir.CSV', 'text/csv') } }

    assert_difference 'Track.count' do
      post api_v1_tournament_match_slot_result_path(@tournament, @match, @slot), params:,
                                                                                 headers: bearer(:regular_user_write)
    end

    assert_response :created
    @slot.reload
    assert_equal @slot.track_id, response.parsed_body['trackId']
    assert_equal @tournament, @slot.track.owner
    assert_not_nil @slot.result
  end

  test '#create links an existing track' do
    @match.update_column(:start_time_in_seconds, nil)

    post api_v1_tournament_match_slot_result_path(@tournament, @match, @slot),
         params: { result: { track_id: tracks(:hellesylt).id } }, headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert_equal tracks(:hellesylt), @slot.reload.track
  end

  test '#create requires a track' do
    post api_v1_tournament_match_slot_result_path(@tournament, @match, @slot),
         params: { result: { track_id: '' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#destroy resets the slot' do
    @slot.update_columns(track_id: tracks(:hellesylt).id, result: 30, is_disqualified: true, notes: 'Late')

    delete api_v1_tournament_match_slot_result_path(@tournament, @match, @slot), headers: bearer(:regular_user_write)

    assert_response :no_content
    @slot.reload
    assert_nil @slot.track_id
    assert_nil @slot.result
    assert_not @slot.is_disqualified
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_match_slot_result_path(@tournament, @match, @slot),
         params: { result: { track_id: tracks(:hellesylt).id } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
