require 'test_helper'

class Api::V1::TerrainProfiles::SharesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @profile = terrain_profiles(:own_draft)
  end

  test '#index lists pilots the owner shared with' do
    get api_v1_terrain_profile_shares_url(@profile), headers: bearer(:regular_user_read)

    assert_response :success
    assert_equal [users(:event_responsible).id], response.parsed_body['items'].pluck('userId')
    assert_equal 'Organizer', response.parsed_body['items'].first['name']
  end

  test '#index forbids someone who does not own the profile' do
    get api_v1_terrain_profile_shares_url(@profile), headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end

  test '#create shares the profile with another pilot' do
    assert_difference -> { @profile.shares.count } do
      post api_v1_terrain_profile_shares_url(@profile), params: { user_id: users(:admin).id },
                                                        headers: bearer(:regular_user_write)
    end

    assert_response :created
    assert_equal users(:admin).id, response.parsed_body['userId']
  end

  test '#create rejects sharing with the owner' do
    post api_v1_terrain_profile_shares_url(@profile), params: { user_id: users(:regular_user).id },
                                                      headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#create requires the write scope' do
    post api_v1_terrain_profile_shares_url(@profile), params: { user_id: users(:admin).id },
                                                      headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#destroy stops sharing with a pilot' do
    assert_difference -> { @profile.shares.count }, -1 do
      delete api_v1_terrain_profile_share_url(@profile, users(:event_responsible).id),
             headers: bearer(:regular_user_write)
    end

    assert_response :no_content
  end
end
