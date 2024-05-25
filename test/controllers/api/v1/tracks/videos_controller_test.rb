require 'test_helper'

class Api::V1::Tracks::VideosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
  end

  test '#show - has no video' do
    track = tracks(:hellesylt)
    track.public_track!

    get api_v1_track_video_url(track)

    assert_response :not_found
  end

  test '#show - public track' do
    track = tracks(:track_with_video)
    track.public_track!

    get api_v1_track_video_url(track)

    assert_response :success

    assert_equal(%w[trackId url videoCode trackOffset videoOffset].sort, response.parsed_body.keys.sort)
  end

  test '#show - private track' do
    track = tracks(:track_with_video)
    track.private_track!

    get api_v1_track_video_url(track)

    assert_response :forbidden
  end

  test '#create - happy path' do
    track = tracks(:hellesylt)
    track.update!(owner: @user)

    sign_in @user

    params = {
      track_video: {
        url: 'https://www.youtube.com/watch?v=RANDOM',
        video_code: 'RANDOM',
        video_offset: 10,
        track_offset: 225
      }
    }

    post api_v1_track_video_url(track), params: params

    assert_response :success
    assert_equal 'https://www.youtube.com/watch?v=RANDOM', response.parsed_body['url']
    assert_equal 'RANDOM', response.parsed_body['videoCode']
    assert_equal 10.0, response.parsed_body['videoOffset']
    assert_equal 225.0, response.parsed_body['trackOffset']
  end

  test '#create - without permissions to' do
    track = tracks(:track_with_video)
    track.update!(owner: users(:admin))

    sign_in @user

    params = { track_video: { url: 'https://www.youtube.com/watch?v=RANDOM' } }
    post api_v1_track_video_url(track), params: params

    assert_response :forbidden
  end

  test '#destroy - happy path' do
    track = tracks(:track_with_video)
    track.update!(owner: @user)

    sign_in @user

    delete api_v1_track_video_url(track)

    assert_response :no_content
    assert_predicate track.video, :blank?
  end

  test '#destroy - with permissions but without video' do
    track = tracks(:hellesylt)
    track.update!(owner: @user)

    sign_in @user

    delete api_v1_track_video_url(track)

    assert_response :no_content
  end

  test '#destroy - without permissions to' do
    track = tracks(:track_with_video)
    track.update!(owner: users(:admin))

    sign_in @user

    delete api_v1_track_video_url(track)

    assert_response :forbidden
  end
end
