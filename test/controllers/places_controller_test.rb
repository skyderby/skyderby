require 'test_helper'

class PlacesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @place = create(:place)
    @admin_user = users(:admin)
  end

  test 'regular user #index' do
    get places_path
    assert_response :success
  end

  test 'regular user #show' do
    get place_path(@place)
    assert_response :success
  end

  test 'regular user #new' do
    get new_place_path
    assert_response :forbidden
  end

  test 'regular user #edit' do
    get edit_place_path(@place)
    assert_response :forbidden
  end

  test 'regular user #create' do
    post places_path, params: { place: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch place_path(@place), params: { place: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete place_path(@place)
    assert_response :forbidden
  end

  test 'admin user #new' do
    sign_in @admin_user
    get new_place_path
    assert_response :success
  end

  test 'admin user #edit' do
    sign_in @admin_user
    get edit_place_path(@place)
    assert_response :success
  end

  test 'admin user #create' do
    sign_in @admin_user
    post places_path, params: { place: { name: 'SSSWWW' } }
    assert_response :success
  end

  test 'admin user #update' do
    sign_in @admin_user
    patch place_path(@place), params: { place: { name: 'SSSWWW' } }
    assert_redirected_to place_path(@place)
  end

  test 'admin user #destroy' do
    sign_in @admin_user
    delete place_path(@place)
    assert_redirected_to places_path
  end
end
