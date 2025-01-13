require 'test_helper'

class BadgesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @badge = create(:badge)
    @admin_user = users(:admin)
  end

  test 'regular user #index' do
    get badges_path
    assert_response :forbidden
  end

  test 'regular user #edit' do
    get edit_badge_path(@badge)
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch badge_path(@badge), params: { badge: { name: 'SSSWWW' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete badge_path(@badge)
    assert_response :forbidden
  end

  test 'admin user #edit' do
    sign_in @admin_user
    get edit_badge_path(@badge), xhr: true
    assert_response :success
  end

  test 'admin user #update' do
    sign_in @admin_user
    patch badge_path(@badge), params: { badge: { name: 'SSSWWW' } }, xhr: true
    assert_response :success
  end

  test 'admin user #destroy' do
    sign_in @admin_user
    delete badge_path(@badge), xhr: true
    assert_response :success
  end
end
