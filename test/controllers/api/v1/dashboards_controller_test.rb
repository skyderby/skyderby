require 'test_helper'

class Api::V1::DashboardsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show requires authentication' do
    get api_v1_dashboard_path

    assert_response :unauthorized
    assert_equal ['Authentication required'], response.parsed_body['errors']
  end

  test '#show renders the dashboard of the current profile' do
    profile = profiles(:regular_user)

    get api_v1_dashboard_path, headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_equal profile.id, body.dig('profile', 'id')
    assert_equal profile.name, body.dig('profile', 'name')
    assert_equal ['base'], body['availableModes']
    assert_equal 'base', body['mode']
    assert_equal 'base', body['activity']
    assert_equal profile.tracks.base.count, body['jumpsCount']
    assert_not body['pro']
    assert_equal 'locations', body.dig('highlights', 0, 'type')
    assert_not body['showCompetitionPlaces']
    assert_equal profile.tracks.base.order(recorded_at: :desc).limit(5).ids, body['recentTracks'].pluck('id')
    assert_equal %w[1m 3m 6m 1y], body.dig('journal', 'periods').pluck('key')
    assert_equal '1y', body.dig('journal', 'period')
  end

  test '#show falls back to an available mode' do
    get api_v1_dashboard_path, params: { mode: 'speed' }, headers: bearer(:regular_user_read)

    assert_equal 'base', response.parsed_body['mode']
  end

  test '#show hides the admin mode' do
    get api_v1_dashboard_path, headers: bearer(:admin_write)

    assert_response :success
    assert_not_includes response.parsed_body['availableModes'], 'admin'
  end

  test '#show renders performance personal bests' do
    profile = profiles(:regular_user)
    Track.create!(pilot: profile, place: places(:hellesylt), suit: suits(:apache), kind: :skydive,
                  visibility: :public_track, recorded_at: 1.day.ago)

    get api_v1_dashboard_path, params: { mode: 'performance' }, headers: bearer(:regular_user_read)

    body = response.parsed_body
    assert_equal 'performance', body['mode']
    assert_equal %w[personal_best personal_best personal_best jumps], body['highlights'].pluck('type')
    assert_equal %w[speed distance time], body['highlights'].first(3).pluck('discipline')
    assert_equal 1, body.dig('highlights', 3, 'value')
    assert_empty body['exitPerformances']
  end

  test '#update requires write scope' do
    patch api_v1_dashboard_path, params: { mode: 'base' }, headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#update persists mode and journal period' do
    user = users(:regular_user)
    Track.create!(pilot: profiles(:regular_user), place: places(:hellesylt), kind: :skydive,
                  visibility: :public_track, recorded_at: 1.day.ago)

    patch api_v1_dashboard_path, params: { mode: 'performance', journal_period: '3m' },
                                 headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'performance', response.parsed_body['mode']
    assert_equal '3m', response.parsed_body.dig('journal', 'period')
    assert_equal 'performance', user.setting.reload.dashboard_mode
    assert_equal '3m', user.setting.journal_period
  end

  test '#update ignores unknown values' do
    patch api_v1_dashboard_path, params: { mode: 'bogus', journal_period: '5y' }, headers: bearer(:regular_user_write)

    assert_response :success
    setting = users(:regular_user).setting
    assert_nil setting.dashboard_mode
    assert_equal '1y', setting.journal_period
  end

  test '#update persists rankings gender for female profiles' do
    profiles(:regular_user).update!(gender: :female)

    patch api_v1_dashboard_path, params: { rankings_gender: 'female' }, headers: bearer(:regular_user_write)

    assert_response :success
    assert_equal 'female', response.parsed_body['rankingsGender']
    assert response.parsed_body['rankingsGenderToggle']
    assert users(:regular_user).setting.reload.dashboard_female_rankings
  end
end
