require 'test_helper'

class Api::V1::Profiles::OverviewsControllerTest < ActionDispatch::IntegrationTest
  test '#show renders the public dashboard of an athlete without the journal' do
    profile = profiles(:regular_user)

    get api_v1_profile_overview_url(profile)

    assert_response :success
    body = response.parsed_body
    assert_equal profile.id, body.dig('profile', 'id')
    assert_not body.key?('journal')
  end

  test '#show responds 404 for missing athlete' do
    get api_v1_profile_overview_url(0)

    assert_response :not_found
  end
end
