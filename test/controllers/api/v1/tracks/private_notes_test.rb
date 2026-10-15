require 'test_helper'

class Api::V1::Tracks::PrivateNotesTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
    @track.update!(owner: users(:regular_user), private_note: 'Exit was too slow')
  end

  test 'track detail includes the private note for the owner' do
    get api_v1_track_path(@track), headers: bearer(:regular_user_read)

    assert_equal 'Exit was too slow', response.parsed_body['privateNote']
  end

  test 'track detail hides the private note from others' do
    get api_v1_track_path(@track), headers: bearer(:admin_read)

    assert_not response.parsed_body.key?('privateNote')
  end

  test 'owner updates the private note' do
    patch api_v1_track_path(@track), params: { track: { private_note: 'Try later exit' } },
                                     headers: bearer(:regular_user_write)

    assert_equal 'Try later exit', @track.reload.private_note
  end

  test 'admin cannot change the private note' do
    patch api_v1_track_path(@track), params: { track: { private_note: 'Overwritten' } }, headers: bearer(:admin_write)

    assert_equal 'Exit was too slow', @track.reload.private_note
  end

  test 'upload stores the private note' do
    post api_v1_tracks_path,
         params: { file: fixture_file_upload('tracks/flysight.csv'), kind: 'skydive', private_note: 'Windy' },
         headers: bearer(:regular_user_write)

    assert_response :created
    assert_equal 'Windy', response.parsed_body['privateNote']
  end
end
