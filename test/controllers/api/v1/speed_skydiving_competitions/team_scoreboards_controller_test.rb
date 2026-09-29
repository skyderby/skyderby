require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::TeamScoreboardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
  end

  test '#show returns not found when teams are disabled' do
    get api_v1_speed_skydiving_competition_team_scoreboard_path(@event)

    assert_response :not_found
  end

  test '#show sums member results per team' do
    @event.update_column(:use_teams, true)
    speed_skydiving_competition_rounds(:nationals_round_1).update_column(:completed_at, Time.zone.now)
    team = @event.teams.create!(name: 'Norway')
    speed_skydiving_competition_competitors(:hinton).update_column(:team_id, team.id)

    get api_v1_speed_skydiving_competition_team_scoreboard_path(@event)

    assert_response :success
    row = response.parsed_body['teams'].sole
    assert_equal 'Norway', row['name']
    assert_in_delta 350.0, row['total']
    member = row['members'].sole
    assert_in_delta 350.0, member['score']
    assert_in_delta 100.0, member['percent']
  end
end
