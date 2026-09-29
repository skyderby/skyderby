require 'test_helper'

class Api::V1::TerrainProfilesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show returns measurements of a published profile' do
    profile = terrain_profiles(:hellesylt_steep)

    get api_v1_terrain_profile_url(profile)

    assert_response :success
    body = response.parsed_body
    assert_equal profile.id, body['id']
    assert_equal 'Steepest', body['name']
    assert_equal 'Hellesylt - Steepest', body['fullName']
    assert_equal places(:hellesylt).id, body['placeId']
    assert_equal({ 'altitude' => 0, 'distance' => 0 }, body['measurements'].first)
    assert_includes body['measurements'], { 'altitude' => 300, 'distance' => 500 }
  end

  test '#show forbids a draft of another user' do
    get api_v1_terrain_profile_url(terrain_profiles(:own_draft))

    assert_response :forbidden
  end

  test '#show returns own draft with a bearer token' do
    get api_v1_terrain_profile_url(terrain_profiles(:own_draft)), headers: bearer(:regular_user_read)

    assert_response :success
    assert_equal 'Backyard cliff', response.parsed_body['name']
  end

  test '#show responds 404 for missing profile' do
    get api_v1_terrain_profile_url(0)

    assert_response :not_found
  end
end
