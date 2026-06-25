require 'test_helper'

class DashboardTest < ActionDispatch::IntegrationTest
  test 'signed-in user with a skydive track sees the performance dashboard' do
    profile = profiles(:regular_user)
    Track.create!(
      pilot: profile,
      place: places(:hellesylt),
      suit: suits(:apache),
      kind: :skydive,
      visibility: :public_track,
      recorded_at: Time.current
    )

    sign_in users(:regular_user)
    get root_path

    assert_response :success
    assert_select '.home-dashboard'
    assert_select '.dashboard-hero__name', text: profile.name
    assert_select '.dashboard-pbs .dashboard-pb', count: Profiles::Dashboard::DISCIPLINES.size
    assert_select '.dashboard-pro'
  end

  test 'a base-only pilot sees the BASE dashboard' do
    # regular_user has only BASE tracks in the fixtures -> BASE is the only mode
    sign_in users(:regular_user)
    get root_path

    assert_response :success
    assert_select '.dashboard-pbs .dashboard-pb'
    assert_select '.dashboard-place', false
  end

  test 'signed-in user without tracks sees the empty upload prompt' do
    # admin has a profile but no tracks and organizes nothing -> no modes
    sign_in users(:admin)
    get root_path

    assert_response :success
    assert_select '.dashboard-empty'
    assert_select '.dashboard-section', false
  end

  test 'anonymous visitor still sees the landing page' do
    get root_path

    assert_response :success
    assert_select '.home-dashboard', false
  end

  test 'update persists the selected dashboard mode on the profile' do
    sign_in users(:regular_user)

    patch dashboard_path, params: { mode: 'base' }

    assert_redirected_to root_path
    assert_equal 'base', profiles(:regular_user).reload.dashboard_mode
  end

  test 'update ignores unknown modes' do
    sign_in users(:regular_user)

    patch dashboard_path, params: { mode: 'bogus' }

    assert_redirected_to root_path
    assert_nil profiles(:regular_user).reload.dashboard_mode
  end
end
