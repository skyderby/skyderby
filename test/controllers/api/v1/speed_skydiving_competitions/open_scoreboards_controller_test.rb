require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::OpenScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show ranks all competitors together' do
    speed_skydiving_competition_rounds(:nationals_round_1).update_column(:completed_at, Time.zone.now)

    get api_v1_speed_skydiving_competition_open_scoreboard_path(speed_skydiving_competitions(:nationals))

    assert_response :success
    body = response.parsed_body
    assert_equal 'open', body['board']
    rows = body['groups'].sole['rows']
    assert_equal(['Nigel Hinton', 'Ingrid Maynard'], rows.map { |row| row.dig('competitor', 'name') })
    assert_equal [350.0, 0.0], rows.pluck('total')
  end
end
