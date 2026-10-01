require 'test_helper'

class Api::V1::Tracks::ProViewsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
    @user = users(:regular_user)
  end

  test '#create requires authentication' do
    post api_v1_track_pro_view_path(@track)

    assert_response :unauthorized
  end

  test '#create requires write scope' do
    assert_no_difference -> { FreeProView.count } do
      post api_v1_track_pro_view_path(@track), headers: bearer(:regular_user_read)
    end

    assert_response :forbidden
  end

  test '#create grants free pro view' do
    assert_difference -> { FreeProView.where(user: @user).count }, 1 do
      post api_v1_track_pro_view_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :success
    body = response.parsed_body
    assert_equal 'granted', body['status']
    assert body['proViewAvailable']
    assert_equal 5, body.dig('freeProViews', 'limit')
    assert_equal 4, body.dig('freeProViews', 'remaining')
    assert_equal Time.current.next_month.beginning_of_month.iso8601, body.dig('freeProViews', 'resetsAt')
  end

  test '#create reports already granted track' do
    FreeProView.create!(user: @user, track: @track)

    post api_v1_track_pro_view_path(@track), headers: bearer(:regular_user_write)

    assert_equal 'already', response.parsed_body['status']
  end

  test '#create reports limit reached' do
    tracks(:boogie_track_1, :boogie_track_2, :boogie_track_3, :boogie_track_4, :boogie_track_5).each do |track|
      FreeProView.create!(user: @user, track:)
    end

    post api_v1_track_pro_view_path(@track), headers: bearer(:regular_user_write)

    body = response.parsed_body
    assert_equal 'limit_reached', body['status']
    assert_not body['proViewAvailable']
    assert_equal 0, body.dig('freeProViews', 'remaining')
  end

  test '#create reports subscriber' do
    post api_v1_track_pro_view_path(@track), headers: bearer(:admin_write)

    assert_equal 'subscriber', response.parsed_body['status']
    assert response.parsed_body['proViewAvailable']
  end
end
