require 'test_helper'

class TerrainProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @own_profile = terrain_profiles(:own_draft)
    @shared_profile = terrain_profiles(:hellesylt_steep)
  end

  test 'guest #index' do
    get terrain_profiles_path

    assert_response :success
  end

  test 'guest #new' do
    get new_terrain_profile_path

    assert_response :forbidden
  end

  test 'signed in user #new' do
    sign_in @user
    get new_terrain_profile_path

    assert_response :success
  end

  test 'signed in user #create' do
    sign_in @user

    assert_difference 'TerrainProfile.count', 1 do
      post terrain_profiles_path, params: {
        terrain_profile: {
          name: 'New cliff',
          measurements_text: "0 0\n100 50"
        }
      }
    end

    profile = TerrainProfile.order(:id).last

    assert_equal @user, profile.user
    assert_not_predicate profile, :published?
    assert_redirected_to terrain_profiles_path(profile: [profile.id])
  end

  test 'places editor can create a shared profile' do
    sign_in users(:places_editor)

    post terrain_profiles_path, params: {
      terrain_profile: { name: 'Community line', ownership: 'shared' }
    }

    assert_predicate TerrainProfile.order(:id).last, :shared?
  end

  test 'regular user can not create a shared profile' do
    sign_in @user

    post terrain_profiles_path, params: {
      terrain_profile: { name: 'Sneaky line', ownership: 'shared' }
    }

    assert_equal @user, TerrainProfile.order(:id).last.user
  end

  test 'publishing requires place and track' do
    sign_in @user

    patch terrain_profile_path(@own_profile), params: {
      terrain_profile: { published: '1' }
    }

    assert_not_predicate @own_profile.reload, :published?
  end

  test 'publishing with place and track' do
    sign_in @user

    patch terrain_profile_path(@own_profile), params: {
      terrain_profile: {
        published: '1',
        place_id: places(:hellesylt).id,
        track_id: tracks(:hellesylt).id
      }
    }

    assert_predicate @own_profile.reload, :published?
  end

  test 'user can not edit somebody else profile' do
    sign_in @user
    get edit_terrain_profile_path(@shared_profile)

    assert_response :forbidden
  end

  test 'user can destroy own profile' do
    sign_in @user

    assert_difference 'TerrainProfile.count', -1 do
      delete terrain_profile_path(@own_profile)
    end

    assert_redirected_to terrain_profiles_path
  end

  test '#select_options lists only published profiles for a guest' do
    get terrain_profiles_select_options_path(frame_id: 'x')

    assert_response :success
    assert_includes response.body, @shared_profile.full_name
    assert_not_includes response.body, @own_profile.full_name
  end

  test '#select_options lists own profiles alongside published ones' do
    sign_in @user
    get terrain_profiles_select_options_path(frame_id: 'x')

    assert_response :success
    assert_includes response.body, @shared_profile.full_name
    assert_includes response.body, @own_profile.full_name
  end

  test '#measurements returns published profile data' do
    get terrain_profile_measurements_path(@shared_profile, format: :json)

    assert_response :success
    assert_equal 'Hellesylt - Steepest', response.parsed_body['name']
  end

  test '#measurements hides unpublished profile of another user' do
    get terrain_profile_measurements_path(@own_profile, format: :json)

    assert_response :forbidden
  end
end
