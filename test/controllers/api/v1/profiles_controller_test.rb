require 'test_helper'

class Api::V1::ProfilesControllerTest < ActionDispatch::IntegrationTest
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
end
