require 'test_helper'

class Tracks::PrivateNotesTest < ActionDispatch::IntegrationTest
  setup do
    @owner = users(:regular_user)
    @track = tracks(:hellesylt)
    @track.update!(owner: @owner, private_note: 'Exit was too slow')
  end

  test 'owner sees the private note on the track page' do
    sign_in @owner

    get track_path(@track)

    assert_select '.track-private-note', text: /Exit was too slow/
  end

  test 'other users and admins do not see the private note' do
    sign_in users(:admin)

    get track_path(@track)

    assert_response :success
    assert_no_match 'Exit was too slow', @response.body
  end

  test 'owner edits the private note with a visibility hint' do
    sign_in @owner

    get edit_track_path(@track)

    assert_select 'textarea[name="track[private_note]"]'
    assert_select '.stacked-input__caption', text: /Only you can see this note/
  end

  test 'admin editing the track does not get the private note field' do
    sign_in users(:admin)

    get edit_track_path(@track)

    assert_select 'textarea[name="track[private_note]"]', false
  end

  test 'owner updates the private note' do
    sign_in @owner

    patch track_path(@track), params: { track: { private_note: 'Try a later exit' } }

    assert_equal 'Try a later exit', @track.reload.private_note
  end

  test 'admin cannot change the private note' do
    sign_in users(:admin)

    patch track_path(@track), params: { track: { private_note: 'Overwritten' } }

    assert_equal 'Exit was too slow', @track.reload.private_note
  end

  test 'upload form offers the private note to signed in pilots' do
    sign_in @owner

    get new_track_file_path, as: :turbo_stream

    assert_match 'track_file[track_attributes][private_note]', @response.body
  end

  test 'upload saves the private note of a signed in pilot' do
    sign_in @owner

    upload_track(private_note: 'Windy day')

    assert_equal 'Windy day', Track.order(:id).last.private_note
  end

  test 'guests cannot upload tracks' do
    assert_no_difference -> { Track.count } do
      upload_track(private_note: 'Windy day')
    end

    assert_redirected_to new_user_session_path
  end

  private

  def upload_track(**attributes)
    post track_files_path, params: {
      track_file: {
        file: fixture_file_upload('tracks/flysight.csv'),
        track_attributes: { kind: :skydive, place_id: places(:hellesylt).id, suit_id: suits(:apache).id,
                            visibility: :public_track, **attributes }
      }
    }
  end
end
