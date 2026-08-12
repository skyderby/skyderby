require 'test_helper'

class SpeedSkydivingCompetitions::ScoreboardUnitsTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = speed_skydiving_competition_results(:hinton_round_1)
  end

  test 'page exposes the preferred units to the client' do
    user = users(:regular_user)
    user.setting.update!(speed_skydiving_units: 'imperial')
    sign_in user

    get speed_skydiving_competition_open_scoreboard_path(@event)

    assert_response :success
    assert_match 'name="speed-skydiving-units" content="imperial"', response.body
  end

  test 'results are rendered in km/h regardless of the preferred units' do
    user = users(:event_responsible)
    user.setting.update!(speed_skydiving_units: 'imperial')
    sign_in user

    get speed_skydiving_competition_path(@event)

    assert_response :success
    assert_match "data-speed-kmh=\"#{@result.final_result}\"", response.body
    assert_match ">#{format('%.2f', @result.final_result)}</span>", response.body
  end

  test 'broadcast template renders outside of a request' do
    Current.reset

    html =
      ApplicationController.render(
        template: 'speed_skydiving_competitions/broadcasts/open_scoreboard',
        formats: [:turbo_stream],
        locals: { event: @event, editable: true }
      )

    assert_match "data-speed-kmh=\"#{@result.final_result}\"", html
  end
end
