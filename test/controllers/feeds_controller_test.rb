require 'test_helper'

class FeedsControllerTest < ActionDispatch::IntegrationTest
  test 'dashboard opens on the feed tab' do
    sign_in users(:admin)
    profiles(:regular_user).follow(user: users(:admin))

    get root_path

    assert_response :success
    assert_select '.feed-card', minimum: 1
  end

  test 'feed invites to follow pilots when following nobody' do
    sign_in users(:admin)

    get root_path

    assert_select '.feed-invite a[href=?]', profiles_path
  end

  test '#show renders an older page of the feed' do
    sign_in users(:admin)
    profiles(:regular_user).follow(user: users(:admin))
    Track.where(pilot: profiles(:regular_user)).update_all(created_at: 3.months.ago)
    until_date = 3.months.ago.to_date.iso8601

    get feed_path(until: until_date)

    assert_select "turbo-frame#feed-#{until_date} .feed-card", minimum: 1
  end

  test '#show requires sign in' do
    get feed_path

    assert_response :unauthorized
  end
end
