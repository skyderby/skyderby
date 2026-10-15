require 'test_helper'

class Profiles::FollowsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:admin)
    @profile = profiles(:regular_user)
  end

  test '#create follows a pilot' do
    sign_in @user

    assert_difference -> { @user.profile_follows.count }, 1 do
      post profile_follow_path(@profile), as: :turbo_stream
    end

    assert_match 'check-solid', @response.body
  end

  test '#create refuses to follow yourself' do
    sign_in users(:regular_user)

    assert_no_difference -> { Profile::Follow.count } do
      post profile_follow_path(@profile), as: :turbo_stream
    end
  end

  test '#create refuses profiles without an account' do
    sign_in @user

    assert_no_difference -> { Profile::Follow.count } do
      post profile_follow_path(profiles(:john)), as: :turbo_stream
    end
  end

  test '#destroy unfollows a pilot' do
    sign_in @user
    @profile.follow(user: @user)

    assert_difference -> { @user.profile_follows.count }, -1 do
      delete profile_follow_path(@profile), as: :turbo_stream
    end
  end

  test '#create sends a guest to sign in' do
    post profile_follow_path(@profile)

    assert_redirected_to new_user_session_path
  end
end
