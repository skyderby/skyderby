require 'test_helper'

class Api::V1::FlightProfiles::PlaybacksControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
    @user = users(:regular_user)
  end

  test '#show requires authentication' do
    get api_v1_flight_profiles_playback_path

    assert_response :unauthorized
  end

  test '#show returns the quota' do
    FlightProfilePlayback.create!(user: @user, track: @track, month: Date.current.beginning_of_month)

    get api_v1_flight_profiles_playback_path, headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_not body['unlimited']
    assert_equal 5, body['limit']
    assert_equal 4, body['remaining']
    assert_equal [@track.id], body['trackIds']
    assert_equal Time.current.next_month.beginning_of_month.iso8601, body['resetsAt']
  end

  test '#create requires write scope' do
    assert_no_difference -> { FlightProfilePlayback.count } do
      post api_v1_flight_profiles_playback_path, params: { track_ids: [@track.id] },
                                                 headers: bearer(:regular_user_read), as: :json
    end

    assert_response :forbidden
  end

  test '#create counts tracks' do
    post api_v1_flight_profiles_playback_path, params: { track_ids: [@track.id] },
                                               headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal 'granted', response.parsed_body['status']
    assert_equal 4, response.parsed_body['remaining']
  end

  test '#create reports limit reached' do
    tracks(:boogie_track_1, :boogie_track_2, :boogie_track_3, :boogie_track_4, :boogie_track_5).each do |track|
      FlightProfilePlayback.create!(user: @user, track:, month: Date.current.beginning_of_month)
    end

    post api_v1_flight_profiles_playback_path, params: { track_ids: [@track.id] },
                                               headers: bearer(:regular_user_write), as: :json

    assert_equal 'limit_reached', response.parsed_body['status']
  end

  test '#create reports subscriber' do
    post api_v1_flight_profiles_playback_path, params: { track_ids: [@track.id] },
                                               headers: bearer(:admin_write), as: :json

    assert_equal 'subscriber', response.parsed_body['status']
    assert response.parsed_body['unlimited']
  end
end
