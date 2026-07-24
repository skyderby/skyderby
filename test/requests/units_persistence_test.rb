require 'test_helper'

class UnitsPersistenceTest < ActionDispatch::IntegrationTest
  test 'track chart units persist to the profile for a signed-in user' do
    user = users(:regular_user)
    sign_in user
    track = tracks(:hellesylt)

    patch track_chart_settings_path(track), params: { charts_units: 'imperial' }, as: :json

    assert_response :no_content
    assert_equal 'imperial', user.reload.setting.default_units
  end

  test 'speed skydiving units persist to the profile for a signed-in user' do
    user = users(:regular_user)
    sign_in user
    event = speed_skydiving_competitions(:nationals)

    patch speed_skydiving_competition_unit_settings_path(event),
          params: { units: 'imperial' },
          headers: { 'Accept' => 'text/vnd.turbo-stream.html' }

    assert_response :success
    assert_equal 'imperial', user.reload.setting.speed_skydiving_units
  end

  test 'track chart units fall back to the session for a guest' do
    track = tracks(:hellesylt)

    patch track_chart_settings_path(track), params: { charts_units: 'imperial' }, as: :json

    assert_response :no_content
  end
end
