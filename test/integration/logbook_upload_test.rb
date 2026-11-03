require 'test_helper'

class LogbookUploadTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
  end

  test 'an upload with the logbook box ticked adds the jump' do
    sign_in @user

    assert_difference -> { @user.profile.jumps.count }, 1 do
      upload_track(add_to_logbook: '1')
    end
  end

  test 'an upload without the box leaves the logbook alone' do
    sign_in @user

    assert_no_difference -> { Jump.count } do
      upload_track(add_to_logbook: '0')
    end
  end

  test 'a masquerading admin does not write to the logbook' do
    sign_in users(:admin)
    post user_masquerades_path(@user)

    assert_difference -> { Track.count }, 1 do
      assert_no_difference -> { Jump.count } do
        upload_track(add_to_logbook: '1')
      end
    end
  end

  private

  def upload_track(add_to_logbook:)
    post track_files_path, params: {
      track_file: {
        file: fixture_file_upload('tracks/flysight.csv'),
        add_to_logbook:,
        track_attributes: {
          kind: :skydive,
          place_id: places(:hellesylt).id,
          suit_id: suits(:apache).id,
          visibility: :public_track
        }
      }
    }
  end
end
