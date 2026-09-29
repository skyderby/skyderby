require 'test_helper'

class Api::V1::PerformanceCompetitions::TeamScoreboardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
  end

  test '#show returns not found when teams are disabled' do
    get api_v1_performance_competition_team_scoreboard_path(@event)

    assert_response :not_found
  end

  test '#show sums member totals per team' do
    @event.update_column(:use_teams, true)
    team = @event.teams.create!(name: 'Norway')
    event_competitors(:john).update_column(:team_id, team.id)
    event_competitors(:travis).update_column(:team_id, team.id)

    get api_v1_performance_competition_team_scoreboard_path(@event)

    assert_response :success
    team_row = response.parsed_body['teams'].sole
    assert_equal 'Norway', team_row['name']
    assert_equal 1, team_row['rank']
    assert_in_delta 357.4, team_row['totalPoints']
    assert_equal [event_competitors(:travis).id, event_competitors(:john).id].sort,
                 team_row['members'].pluck('competitorId').sort
  end
end
