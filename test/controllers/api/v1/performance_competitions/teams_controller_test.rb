require 'test_helper'

class Api::V1::PerformanceCompetitions::TeamsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create, #update and #destroy manage teams' do
    post api_v1_performance_competition_teams_path(@event),
         params: { team: { name: 'Red' } },
         headers: bearer(:event_responsible_write)

    assert_response :created
    team_id = response.parsed_body['id']
    assert_empty response.parsed_body['competitorIds']

    patch api_v1_performance_competition_team_path(@event, team_id),
          params: { team: { name: 'Blue' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal 'Blue', response.parsed_body['name']

    delete api_v1_performance_competition_team_path(@event, team_id), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_empty @event.teams.reload
  end

  test '#create returns validation errors' do
    post api_v1_performance_competition_teams_path(@event),
         params: { team: { name: '' } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_teams_path(@event),
         params: { team: { name: 'Red' } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
