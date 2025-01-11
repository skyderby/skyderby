require 'test_helper'

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @profile = create(:profile)
    @admin_user = users(:admin)
  end

  test 'regular user #index' do
    get profiles_path
    assert_response :forbidden
  end

  test 'regular user #show' do
    get profile_path(@profile)
    assert_response :success
  end

  test 'regular user #edit' do
    get edit_profile_path(@profile)
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch profile_path(@profile), params: { profile: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete profile_path(@profile)
    assert_response :forbidden
  end

  test 'admin user #index' do
    sign_in @admin_user
    get profiles_path
    assert_response :success
  end
end
