require 'test_helper'

class Tracks::BookmarksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @track = tracks(:boogie_track_1)
  end

  test '#create bookmarks a track and shows a filled star' do
    sign_in @user

    assert_difference -> { @user.track_bookmarks.count }, 1 do
      post track_bookmark_path(@track), as: :turbo_stream
    end

    assert_response :success
    assert_match 'icon--star-solid', @response.body
  end

  test '#create twice keeps a single bookmark' do
    sign_in @user
    @track.bookmark(user: @user)

    assert_no_difference -> { @user.track_bookmarks.count } do
      post track_bookmark_path(@track), as: :turbo_stream
    end
  end

  test '#destroy removes the bookmark and shows an empty star' do
    sign_in @user
    @track.bookmark(user: @user)

    assert_difference -> { @user.track_bookmarks.count }, -1 do
      delete track_bookmark_path(@track), as: :turbo_stream
    end

    assert_match 'icon--star-regular', @response.body
  end

  test '#create sends a guest to sign in' do
    assert_no_difference -> { Track::Bookmark.count } do
      post track_bookmark_path(@track)
    end

    assert_redirected_to new_user_session_path
  end

  test '#create is forbidden for a private track of another pilot' do
    @track.update!(visibility: :private_track)
    sign_in @user

    assert_no_difference -> { Track::Bookmark.count } do
      post track_bookmark_path(@track), as: :turbo_stream
    end

    assert_match 'toast', @response.body
  end

  test 'tracks index filters by bookmarks' do
    sign_in @user
    tracks(:boogie_track_2).bookmark(user: @user)

    get tracks_path(bookmarked: true)

    assert_response :success
    assert_match track_path(tracks(:boogie_track_2)), @response.body
    assert_no_match(/#{track_path(@track)}"/, @response.body)
  end

  test 'tracks index keeps bookmarked unlisted tracks of other pilots' do
    sign_in @user
    @track.update!(visibility: :unlisted_track)
    @track.bookmark(user: @user)

    get tracks_path(bookmarked: true)

    assert_match track_path(@track), @response.body
  end
end
