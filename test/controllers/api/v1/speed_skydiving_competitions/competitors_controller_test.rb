require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @male = speed_skydiving_competition_categories(:male)
    @maynard = speed_skydiving_competition_competitors(:maynard)
  end

  test '#create adds a competitor with a new event profile' do
    get api_v1_speed_skydiving_competition_path(@event)
    etag = response.headers['ETag']

    post api_v1_speed_skydiving_competition_competitors_path(@event),
         params: { competitor: { assigned_number: '7', category_id: @male.id,
                                 profile_attributes: { name: 'New Pilot', country_id: countries(:italy).id } } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    body = response.parsed_body
    assert_equal 'New Pilot', body['name']
    assert_equal @male.id, body['categoryId']
    assert_equal countries(:italy).id, body['countryId']
    assert body['profileOwnedByEvent']

    get api_v1_speed_skydiving_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert_includes response.parsed_body['competitors'].pluck('name'), 'New Pilot'
  end

  test '#create reports validation errors' do
    post api_v1_speed_skydiving_competition_competitors_path(@event),
         params: { competitor: { assigned_number: '7', category_id: @male.id, profile_id: profiles(:alex).id,
                                 team_id: '' } },
         headers: bearer(:event_responsible_write), as: :json
    assert_response :created

    post api_v1_speed_skydiving_competition_competitors_path(@event),
         params: { competitor: { assigned_number: '8', category_id: @male.id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update assigns a team and renames the event profile' do
    team = @event.teams.create!(name: 'Norway')
    get api_v1_speed_skydiving_competition_path(@event)
    etag = response.headers['ETag']

    patch api_v1_speed_skydiving_competition_competitor_path(@event, @maynard),
          params: { competitor: { team_id: team.id, profile_attributes: { name: 'Ingrid M' } } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal team.id, response.parsed_body['teamId']
    assert_equal 'Ingrid M', @maynard.reload.profile.name

    get api_v1_speed_skydiving_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
  end

  test '#update rejects a team of another event' do
    other = SpeedSkydivingCompetition.create!(name: 'Other', starts_at: Time.zone.today,
                                              place: places(:puschino), responsible: users(:admin))
    team = other.teams.create!(name: 'Foreign')

    patch api_v1_speed_skydiving_competition_competitor_path(@event, @maynard),
          params: { competitor: { team_id: team.id } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :not_found
    assert_nil @maynard.reload.team_id
  end

  test '#destroy removes a competitor without results' do
    delete api_v1_speed_skydiving_competition_competitor_path(@event, @maynard),
           headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not SpeedSkydivingCompetition::Competitor.exists?(@maynard.id)
  end

  test '#destroy is forbidden for non-editors' do
    delete api_v1_speed_skydiving_competition_competitor_path(@event, @maynard),
           headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
