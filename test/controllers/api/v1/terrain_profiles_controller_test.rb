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

  test '#show reports ownership and editability' do
    get api_v1_terrain_profile_url(terrain_profiles(:own_draft)), headers: bearer(:regular_user_read)

    body = response.parsed_body
    assert_equal 'own', body['ownership']
    assert body['editable']
    assert_not body['published']
  end

  test '#index lists published profiles for guests' do
    get api_v1_terrain_profiles_url

    assert_response :success
    names = response.parsed_body['items'].pluck('name')
    assert_includes names, 'Steepest'
    assert_not_includes names, 'Backyard cliff'
    assert_not response.parsed_body['creatable']
  end

  test '#index lists own profiles' do
    get api_v1_terrain_profiles_url(scope: 'own'), headers: bearer(:regular_user_read)

    assert_equal ['Backyard cliff'], response.parsed_body['items'].pluck('name')
  end

  test '#index filters by place' do
    get api_v1_terrain_profiles_url(place_id: places(:hellesylt).id)

    assert_equal [terrain_profiles(:hellesylt_steep).id], response.parsed_body['items'].pluck('id')
  end

  test '#create saves a draft with measurements' do
    assert_difference -> { TerrainProfile.count }, 1 do
      post api_v1_terrain_profiles_url,
           params: { terrain_profile: { name: 'New line',
                                        measurements: [{ altitude: 100, distance: 50 },
                                                       { altitude: 300, distance: 200 }] } },
           headers: bearer(:regular_user_write)
    end

    assert_response :created
    profile = TerrainProfile.last
    assert_equal users(:regular_user), profile.user
    assert_equal([[100, 50], [300, 200]], profile.measurements.map { [it.altitude, it.distance] })
    assert_includes response.parsed_body['measurements'], { 'altitude' => 300, 'distance' => 200 }
  end

  test '#create requires authentication' do
    post api_v1_terrain_profiles_url, params: { terrain_profile: { name: 'New line' } }

    assert_response :unauthorized
  end

  test '#update replaces measurements of own profile' do
    profile = terrain_profiles(:own_draft)

    patch api_v1_terrain_profile_url(profile),
          params: { terrain_profile: { name: 'Renamed', measurements: [{ altitude: 50, distance: 10 }] } },
          headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'Renamed', profile.reload.name
    assert_equal([[50, 10]], profile.measurements.map { [it.altitude, it.distance] })
  end

  test '#update forbidden for profiles of others' do
    patch api_v1_terrain_profile_url(terrain_profiles(:own_draft)),
          params: { terrain_profile: { name: 'Hijack' } },
          headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end

  test '#destroy deletes own profile' do
    assert_difference -> { TerrainProfile.count }, -1 do
      delete api_v1_terrain_profile_url(terrain_profiles(:own_draft)), headers: bearer(:regular_user_write)
    end

    assert_response :no_content
  end
end
