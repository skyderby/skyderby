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

  test 'update persists the female rankings preference for a female profile' do
    profiles(:regular_user).update!(gender: :female)
    sign_in users(:regular_user)

    patch dashboard_path, params: { rankings_gender: 'female' }

    assert_redirected_to root_path
    assert profiles(:regular_user).reload.dashboard_female_rankings
  end

  test 'update ignores the rankings gender for a non-female profile' do
    profiles(:regular_user).update!(gender: :male)
    sign_in users(:regular_user)

    patch dashboard_path, params: { rankings_gender: 'female' }

    assert_redirected_to root_path
    assert_not profiles(:regular_user).reload.dashboard_female_rankings
  end

  test 'a female pilot sees the Open/Female rankings toggle' do
    profiles(:regular_user).update!(gender: :female)
    sign_in users(:regular_user)

    get root_path

    assert_response :success
    assert_select '.dashboard-rankings-scope'
  end

  test 'a pilot without a female profile does not see the rankings toggle' do
    sign_in users(:regular_user)

    get root_path

    assert_response :success
    assert_select '.dashboard-rankings-scope', false
  end

  test 'the competitions block includes BASE tournaments' do
    tournament = tournaments(:world_base_race)
    tournament.update_column(:status, Tournament.statuses[:published])
    Tournament::Competitor.create!(tournament:, profile: profiles(:regular_user), suit: suits(:apache))

    sign_in users(:regular_user)
    get root_path

    assert_response :success
    assert_select '.dashboard-list__title', text: tournament.name
  end
end
