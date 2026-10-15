require 'test_helper'

class Api::V1::Profiles::FollowsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#create follows a pilot' do
    assert_difference -> { users(:regular_user).profile_follows.count }, 1 do
      post api_v1_profile_follow_path(profiles(:admin)), headers: bearer(:regular_user_write)
    end

    assert response.parsed_body['followed']
  end

  test '#create refuses yourself' do
    post api_v1_profile_follow_path(profiles(:regular_user)), headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#destroy unfollows a pilot' do
    profiles(:admin).follow(user: users(:regular_user))

    assert_difference -> { users(:regular_user).profile_follows.count }, -1 do
      delete api_v1_profile_follow_path(profiles(:admin)), headers: bearer(:regular_user_write)
    end
  end

  test 'overview reports follow state' do
    profiles(:admin).follow(user: users(:regular_user))

    get api_v1_profile_overview_path(profiles(:admin)), headers: bearer(:regular_user_read)

    assert response.parsed_body.dig('profile', 'followed')
    assert response.parsed_body.dig('profile', 'followable')
  end
end
