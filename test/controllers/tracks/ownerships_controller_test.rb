require 'test_helper'

class Tracks::OwnershipsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin_user = users(:admin)
    @track = create_track_from_file 'flysight.csv'
  end

  test 'regular user show is not allowed' do
    get track_ownership_path(track_id: @track.id)
    assert_response :forbidden
  end

  test 'regular user update is not allowed' do
    put track_ownership_path(track_id: @track.id), params: {
      track_ownership: {
        type: 'None',
        profile_id: '3'
      }
    }, xhr: true
    assert_response :forbidden
  end

  test 'admin user show is allowed' do
    sign_in @admin_user
    get track_ownership_path(track_id: @track.id)
    assert_response :success
  end

  test 'admin user update is allowed' do
    sign_in @admin_user
    put track_ownership_path(track_id: @track.id), params: {
      track_ownership: {
        type: 'None',
        profile_id: '3'
      }
    }, xhr: true
    assert_response :success
  end
end
