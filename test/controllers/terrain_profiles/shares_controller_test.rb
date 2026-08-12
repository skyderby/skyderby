require 'test_helper'

module TerrainProfiles
  class SharesControllerTest < ActionDispatch::IntegrationTest
    setup do
      @user = users(:regular_user)
      @own_profile = terrain_profiles(:own_draft)
    end

    test 'owner opens the share dialog' do
      sign_in @user
      get new_terrain_profile_share_path(@own_profile), as: :turbo_stream

      assert_response :success
    end

    test 'non owner can not open the share dialog' do
      sign_in users(:places_editor)
      get new_terrain_profile_share_path(@own_profile), as: :turbo_stream

      assert_no_match 'modal-root', response.body
    end

    test 'owner shares a profile' do
      sign_in @user

      assert_difference 'TerrainProfile::Share.count', 1 do
        post terrain_profile_shares_path(@own_profile),
             params: { terrain_profile_share: { user_id: users(:admin).id } }
      end

      assert_redirected_to terrain_profiles_path(profile: [@own_profile.id])
    end

    test 'sharing twice with the same user is rejected' do
      sign_in @user

      assert_no_difference 'TerrainProfile::Share.count' do
        post terrain_profile_shares_path(@own_profile),
             params: { terrain_profile_share: { user_id: users(:event_responsible).id } }
      end
    end

    test 'sharing with the owner is rejected' do
      sign_in @user

      assert_no_difference 'TerrainProfile::Share.count' do
        post terrain_profile_shares_path(@own_profile),
             params: { terrain_profile_share: { user_id: @user.id } }
      end
    end

    test 'non owner can not share' do
      sign_in users(:event_responsible)

      assert_no_difference 'TerrainProfile::Share.count' do
        post terrain_profile_shares_path(@own_profile),
             params: { terrain_profile_share: { user_id: users(:admin).id } }
      end

      assert_response :forbidden
    end
  end
end
