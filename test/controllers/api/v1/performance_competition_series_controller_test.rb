require 'test_helper'

class Api::V1::PerformanceCompetitionSeriesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @series = PerformanceCompetitionSeries.create!(
      name: 'World Cup', responsible: users(:event_responsible), status: :published
    )
    @series.included_competitions.create!(event: events(:nationals))
    @series.rounds.create!(discipline: :distance, completed: true)
  end

  test '#show returns series details' do
    get api_v1_performance_competition_series_path(@series)

    assert_response :success
    body = response.parsed_body
    assert_equal 'performance_competition_series', body['type']
    assert_equal '2015-03-01', body['startsAt']
    assert body['scoreboardAvailable']
    assert_equal [events(:nationals).id], body['competitions'].pluck('id')
    assert_equal ['distance-1'], body['rounds'].pluck('code')
  end

  test '#show hides drafts from guests' do
    @series.update!(status: :draft)

    get api_v1_performance_competition_series_path(@series)
    assert_response :not_found

    get api_v1_performance_competition_series_path(@series), headers: bearer(:event_responsible_write)
    assert_response :success
  end
end
