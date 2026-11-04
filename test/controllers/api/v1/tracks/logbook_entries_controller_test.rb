require 'test_helper'

class Api::V1::Tracks::LogbookEntriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @profile = profiles(:regular_user)
    @track = tracks(:hellesylt)
    @track.update!(exited_at: Time.zone.local(2026, 5, 1, 10), recorded_at: Time.zone.local(2026, 5, 1, 10, 5))
  end

  test '#create requires write scope' do
    post api_v1_track_logbook_entry_path(@track), headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#create records the track in the pilot logbook' do
    assert_difference -> { @profile.jumps.count }, 1 do
      post api_v1_track_logbook_entry_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :created
    jump = @profile.jumps.sole
    assert_equal @track, jump.track
    assert_equal jump.client_uuid, response.parsed_body['clientUuid']
    assert_equal @track.id, response.parsed_body['trackId']
  end

  test '#create reuses the jump already linked to the track' do
    2.times { post api_v1_track_logbook_entry_path(@track), headers: bearer(:regular_user_write) }

    assert_equal 1, @profile.jumps.count
  end

  test '#create refuses tracks of other pilots' do
    post api_v1_track_logbook_entry_path(tracks(:boogie_track_1)), headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
