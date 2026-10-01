require 'test_helper'

class Api::V1::Profiles::OverviewsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show renders the public dashboard of an athlete without the journal' do
    profile = profiles(:regular_user)

    get api_v1_profile_overview_url(profile)

    assert_response :success
    body = response.parsed_body
    assert_equal profile.id, body.dig('profile', 'id')
    assert_not body.key?('journal')
  end

  test '#show keeps recent tracks and exit profiles out of the public overview' do
    profile = profiles(:regular_user)
    Track.create!(pilot: profile, owner: users(:regular_user), kind: :base, visibility: :private_track,
                  suit: suits(:apache), recorded_at: 1.day.ago)

    get api_v1_profile_overview_url(profile, mode: 'base')

    assert_response :success
    assert_empty response.parsed_body['recentTracks'].to_a
    assert_empty response.parsed_body['exitPerformances'].to_a
  end

  test '#show responds 404 for missing athlete' do
    get api_v1_profile_overview_url(0)

    assert_response :not_found
  end

  test '#show tells an admin they can edit and impersonate a pilot' do
    get api_v1_profile_overview_url(profiles(:regular_user)), headers: bearer(:admin_read)

    profile = response.parsed_body['profile']
    assert profile['editable']
    assert profile['impersonatable']
  end

  test '#show offers nothing to anonymous viewers' do
    get api_v1_profile_overview_url(profiles(:regular_user))

    profile = response.parsed_body['profile']
    assert_not profile['editable']
    assert_not profile['impersonatable']
  end
end
