require 'test_helper'

class CountriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @country = create(:country)
    @admin_user = users(:admin)
  end

  test 'regular user #index' do
    get countries_path
    assert_response :forbidden
  end

  test 'regular user #show' do
    get country_path(@country)
    assert_response :forbidden
  end

  test 'regular user #new' do
    get new_country_path
    assert_response :forbidden
  end

  test 'regular user #edit' do
    get edit_country_path(@country)
    assert_response :forbidden
  end

  test 'regular user #create' do
    post countries_path, params: { country: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch country_path(@country), params: { country: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete country_path(@country)
    assert_response :forbidden
  end

  test 'admin user #new' do
    sign_in @admin_user
    get new_country_path
    assert_response :success
  end

  test 'admin user #edit' do
    sign_in @admin_user
    get edit_country_path(@country)
    assert_response :success
  end

  test 'admin user #create' do
    sign_in @admin_user
    post countries_path, params: { country: { name: 'SSSWWW', code: 'SWW' } }
    assert_redirected_to country_path(Country.find_by(code: 'SWW'))
  end

  test 'admin user #update' do
    sign_in @admin_user
    patch country_path(@country), params: { country: { name: 'SSSWWW' } }
    assert_redirected_to country_path(@country)
  end

  test 'admin user #destroy' do
    sign_in @admin_user
    delete country_path(@country)
    assert_redirected_to countries_path
  end
end
