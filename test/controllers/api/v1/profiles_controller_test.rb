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
end
