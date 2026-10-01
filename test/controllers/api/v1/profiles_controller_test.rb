require 'test_helper'

class Api::V1::ProfilesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @profile = profiles(:alex)
  end

  test '#show' do
    get api_v1_profile_url(@profile)

    expected_json =
      {
        id: @profile.id,
        name: @profile.name,
        countryId: nil,
        gender: @profile.gender,
        countryCode: nil,
        tracksCount: { skydive: 0, base: 0, speedSkydiving: 0 },
        contributor: false,
        photo: {
          original: '/images/original/missing.png',
          medium: '/images/medium/missing.png',
          thumb: '/images/thumb/missing.png'
        },
        personalScores: []
      }.deep_stringify_keys

    assert_equal expected_json, response.parsed_body
  end

  test '#index searches athletes by name' do
    get api_v1_profiles_url(query: @profile.name)

    assert_response :success
    item = response.parsed_body['items'].find { it['id'] == @profile.id }
    assert item
    assert_equal(
      { 'skydive' => @profile.tracks.skydive.count, 'base' => @profile.tracks.base.count,
        'speedSkydiving' => 0 }, item['tracksCount']
    )
  end

  test '#index returns featured athletes without a query' do
    get api_v1_profiles_url

    assert_response :success
    assert_kind_of Array, response.parsed_body['items']
  end

  test '#update lets the owner change name, country and gender' do
    profile = profiles(:regular_user)

    patch api_v1_profile_url(profile),
          params: { profile: { name: 'New Name', country_id: countries(:norway).id, gender: 'female' } },
          headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'New Name', profile.reload.name
    assert_equal countries(:norway), profile.country
    assert_equal 'female', response.parsed_body['gender']
  end

  test '#update forbids editing someone else\'s profile' do
    patch api_v1_profile_url(profiles(:admin)), params: { profile: { name: 'Nope' } },
                                                headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
