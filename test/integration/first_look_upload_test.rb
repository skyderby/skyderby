require 'test_helper'

class FirstLookUploadTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    tracks(:hellesylt).update_columns(owner_type: 'User', owner_id: @user.id, created_at: 2.days.ago)
    tracks(:track_with_video).update_columns(owner_type: 'User', owner_id: @user.id, created_at: 2.days.ago)
    sign_in @user
  end

  test 'grants a first look on the third upload of a returning free user' do
    assert_difference -> { FreeProView.where(first_look: true).count }, 1 do
      upload_track
    end

    record = FreeProView.where(first_look: true).order(:id).last
    assert_equal @user, record.user
    assert_predicate record.track, :persisted?

    follow_redirect!
    assert_response :success
    assert_match I18n.t('tracks.first_look.title'), response.body
    assert_match 'data-controller="dialog"', response.body
  end

  test 'does not grant a first look on the very first upload' do
    tracks(:hellesylt).update_columns(owner_type: nil, owner_id: nil)
    tracks(:track_with_video).update_columns(owner_type: nil, owner_id: nil)

    assert_no_difference -> { FreeProView.where(first_look: true).count } do
      upload_track
    end
  end

  private

  def upload_track
    post track_files_path, params: {
      track_file: {
        file: fixture_file_upload('tracks/flysight.csv'),
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
