require 'test_helper'

class FlightProfiles::PlaybacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @track = tracks(:hellesylt)
  end

  test '#create asks guests to sign up' do
    assert_no_difference -> { FlightProfilePlayback.count } do
      post flight_profiles_playback_path, params: { track_ids: [@track.id] }, as: :json
    end

    assert_response :unauthorized
    assert_equal 'sign_in_required', response.parsed_body['status']
  end

  test '#create counts the track for a free user' do
    sign_in users(:regular_user)

    assert_difference -> { FlightProfilePlayback.count }, 1 do
      post flight_profiles_playback_path, params: { track_ids: [@track.id] }, as: :json
    end

    assert_response :success
    body = response.parsed_body
    assert_equal 'granted', body['status']
    assert_equal 4, body['remaining']
    assert_equal [@track.id], body['track_ids']
  end

  test '#create reports the exhausted quota' do
    user = users(:regular_user)
    tracks(:boogie_track_1, :boogie_track_2, :boogie_track_3, :boogie_track_4, :boogie_track_5).each do |track|
      FlightProfilePlayback.create!(user:, track:, month: Date.current.beginning_of_month)
    end
    sign_in user

    post flight_profiles_playback_path, params: { track_ids: [@track.id] }, as: :json

    assert_equal 'limit_reached', response.parsed_body['status']
    assert_equal 0, response.parsed_body['remaining']
  end

  test '#create lets subscribers play without counting' do
    sign_in users(:admin)

    assert_no_difference -> { FlightProfilePlayback.count } do
      post flight_profiles_playback_path, params: { track_ids: [@track.id] }, as: :json
    end

    assert_equal 'subscriber', response.parsed_body['status']
    assert response.parsed_body['unlimited']
  end
end
