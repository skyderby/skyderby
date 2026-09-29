require 'test_helper'

class Api::V1::SpeedSkydivingCompetitionSeriesControllerTest < ActionDispatch::IntegrationTest
  test '#show returns series details without a scoreboard' do
    series = SpeedSkydivingCompetitionSeries.create!(
      name: 'Speed Cup', responsible: users(:event_responsible), status: :published
    )
    series.included_competitions.create!(speed_skydiving_competition: speed_skydiving_competitions(:nationals))

    get api_v1_speed_skydiving_competition_series_path(series)

    assert_response :success
    body = response.parsed_body
    assert_equal 'speed_skydiving_competition_series', body['type']
    assert_not body['scoreboardAvailable']
    assert_equal ['Russian Nationals'], body['competitions'].pluck('name')
  end
end
