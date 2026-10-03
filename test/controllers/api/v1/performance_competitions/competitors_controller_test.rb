require 'test_helper'

class Api::V1::PerformanceCompetitions::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#create adds a competitor with an existing profile' do
    post api_v1_performance_competition_competitors_path(@event),
         params: {
           competitor: {
             profile_id: profiles(:regular_user).id, category_id: event_sections(:intermediate).id,
             suit_id: suits(:apache).id, assigned_number: '42'
           }
         },
         headers: bearer(:event_responsible_write)

    assert_response :created
    body = response.parsed_body
    assert_equal profiles(:regular_user).id, body.dig('profile', 'id')
    assert_equal event_sections(:intermediate).id, body['categoryId']
    assert_equal '42', body['assignedNumber']
    assert_not body['profileOwnedByEvent']
  end

  test '#create adds a competitor with a new event owned profile' do
    assert_difference -> { Profile.count } => 1 do
      post api_v1_performance_competition_competitors_path(@event),
           params: {
             competitor: {
               category_id: event_sections(:intermediate).id, suit_id: suits(:apache).id,
               profile_attributes: { name: 'Brand New Pilot', country_id: countries(:norway).id }
             }
           },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    body = response.parsed_body
    assert body['profileOwnedByEvent']
    assert_equal countries(:norway).id, body['countryId']
  end

  test '#create rejects a team from another event' do
    team = PerformanceCompetition::Team.create!(event: events(:boogie), name: 'Foreign')

    post api_v1_performance_competition_competitors_path(@event),
         params: {
           competitor: {
             profile_id: profiles(:regular_user).id, category_id: event_sections(:intermediate).id,
             suit_id: suits(:apache).id, team_id: team.id
           }
         },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create returns validation errors' do
    post api_v1_performance_competition_competitors_path(@event),
         params: { competitor: { profile_id: profiles(:regular_user).id } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_competitors_path(@event),
         params: { competitor: { profile_id: profiles(:regular_user).id } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#update assigns team and number' do
    team = @event.teams.create!(name: 'Red')

    patch api_v1_performance_competition_competitor_path(@event, event_competitors(:alex)),
          params: { competitor: { team_id: team.id, assigned_number: '7' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal team.id, response.parsed_body['teamId']
    assert_equal '7', event_competitors(:alex).reload.assigned_number
  end

  test '#update clears the team' do
    team = @event.teams.create!(name: 'Red')
    event_competitors(:alex).update!(team:)

    patch api_v1_performance_competition_competitor_path(@event, event_competitors(:alex)),
          params: { competitor: { team_id: '' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_nil event_competitors(:alex).reload.team_id
  end

  test '#destroy removes a competitor without results' do
    delete api_v1_performance_competition_competitor_path(@event, event_competitors(:alex)),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
  end

  test '#destroy refuses a competitor with results' do
    delete api_v1_performance_competition_competitor_path(@event, event_competitors(:john)),
           headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end
end
