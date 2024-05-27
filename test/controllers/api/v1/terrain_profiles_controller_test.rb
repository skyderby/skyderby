require 'test_helper'

class Api::V1::TerrainProfilesControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns terrain profile params' do
    get api_v1_terrain_profiles_url

    assert_response :success
    assert_not_empty response.parsed_body['items']
    assert_equal %w[id name placeId], response.parsed_body['items'].first.keys.sort
    assert_not_empty response.parsed_body.dig('relations', 'places')
  end
end
