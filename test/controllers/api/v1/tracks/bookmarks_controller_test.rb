require 'test_helper'

class Api::V1::Tracks::BookmarksControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @user = users(:regular_user)
    @track = tracks(:boogie_track_1)
  end

  test '#create requires authentication' do
    post api_v1_track_bookmark_path(@track)

    assert_response :unauthorized
  end

  test '#create requires write scope' do
    assert_no_difference -> { Track::Bookmark.count } do
      post api_v1_track_bookmark_path(@track), headers: bearer(:regular_user_read)
    end

    assert_response :forbidden
  end

  test '#create bookmarks a track' do
    assert_difference -> { @user.track_bookmarks.count }, 1 do
      post api_v1_track_bookmark_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :success
    assert response.parsed_body['bookmarked']
  end

  test '#create is idempotent' do
    @track.bookmark(user: @user)

    assert_no_difference -> { Track::Bookmark.count } do
      post api_v1_track_bookmark_path(@track), headers: bearer(:regular_user_write)
    end

    assert_response :success
  end

  test '#create hides private tracks of other pilots' do
    @track.update!(visibility: :private_track)

    post api_v1_track_bookmark_path(@track), headers: bearer(:regular_user_write)

    assert_response :not_found
  end

  test '#destroy removes the bookmark' do
    @track.bookmark(user: @user)

    assert_difference -> { @user.track_bookmarks.count }, -1 do
      delete api_v1_track_bookmark_path(@track), headers: bearer(:regular_user_write)
    end

    assert_not response.parsed_body['bookmarked']
  end

  test 'track detail reports bookmark state' do
    @track.bookmark(user: @user)

    get api_v1_track_path(@track), headers: bearer(:regular_user_read)

    assert response.parsed_body['bookmarked']
  end

  test 'tracks index filters by bookmarks' do
    @track.update!(visibility: :unlisted_track)
    @track.bookmark(user: @user)

    get api_v1_tracks_path(bookmarked: true), headers: bearer(:regular_user_read)

    assert_equal [@track.id], response.parsed_body['items'].pluck('id')
  end

  test 'tracks index returns nothing bookmarked for a guest' do
    @track.bookmark(user: @user)

    get api_v1_tracks_path(bookmarked: true)

    assert_empty response.parsed_body['items']
  end
end
