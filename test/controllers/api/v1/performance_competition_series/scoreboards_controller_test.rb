require 'test_helper'

class Api::V1::PerformanceCompetitionSeries::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @series = PerformanceCompetitionSeries.create!(
      name: 'World Cup', responsible: users(:event_responsible), status: :published
    )
    @series.included_competitions.create!(event: events(:nationals))
    @series.rounds.create!(discipline: :distance, completed: true)
  end

  test '#show uses wind cancelled results by default' do
    get api_v1_performance_competition_series_scoreboard_path(@series)

    assert_response :success
    body = response.parsed_body
    assert_not body['displayRawResults']
    assert_equal(%w[Advanced Intermediate], body['groups'].map { |group| group.dig('category', 'name') })
    rows = body['groups'].first['rows']
    assert_equal [100.0, 82.8], rows.first(2).pluck('totalPoints')
    assert_equal 'WS Performance Nationals', rows.first.dig('competition', 'name')
    assert_in_delta 2900.0, rows.first['results'].sole['result']
  end

  test '#show can display raw results' do
    get api_v1_performance_competition_series_scoreboard_path(@series, display_raw_results: 1)

    rows = response.parsed_body['groups'].first['rows']
    assert_equal [100.0, 83.3], rows.first(2).pluck('totalPoints')
    assert_in_delta 3000.0, rows.first['results'].sole['result']
  end

  test '#show hides standings of a surprise series' do
    @series.update!(status: :surprise)

    get api_v1_performance_competition_series_scoreboard_path(@series)

    assert response.parsed_body['surprise']
    assert_empty response.parsed_body['groups']
  end
end
