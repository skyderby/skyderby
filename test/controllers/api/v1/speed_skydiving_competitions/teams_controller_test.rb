require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::TeamsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
  end

  test '#create adds a team visible in the detail' do
    get api_v1_speed_skydiving_competition_path(@event)
    etag = response.headers['ETag']

    post api_v1_speed_skydiving_competition_teams_path(@event),
         params: { team: { name: 'Norway' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_equal 'Norway', response.parsed_body['name']

    get api_v1_speed_skydiving_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert_equal ['Norway'], response.parsed_body['teams'].pluck('name')
  end

  test '#update and #destroy manage a team' do
    team = @event.teams.create!(name: 'Norway')

    patch api_v1_speed_skydiving_competition_team_path(@event, team),
          params: { team: { name: 'Team Norway' } }, headers: bearer(:event_responsible_write), as: :json
    assert_response :success
    assert_equal 'Team Norway', team.reload.name

    delete api_v1_speed_skydiving_competition_team_path(@event, team), headers: bearer(:event_responsible_write)
    assert_response :no_content
    assert_not SpeedSkydivingCompetition::Team.exists?(team.id)
  end

  test '#create reports validation errors' do
    post api_v1_speed_skydiving_competition_teams_path(@event),
         params: { team: { name: '' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non-editors' do
    post api_v1_speed_skydiving_competition_teams_path(@event),
         params: { team: { name: 'Norway' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
