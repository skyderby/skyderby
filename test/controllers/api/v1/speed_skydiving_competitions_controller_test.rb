require 'test_helper'

class Api::V1::SpeedSkydivingCompetitionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
  end

  test '#show returns event details' do
    get api_v1_speed_skydiving_competition_path(@event)

    assert_response :success
    body = response.parsed_body
    assert_equal 'speed_skydiving_competition', body['type']
    assert_equal %w[Male Female], body['categories'].pluck('name')
    assert_equal (1..8).to_a, body['rounds'].pluck('number')
    assert_equal %w[scoreboard open], body['boards'].pluck('key')
    hinton = body['competitors'].find { |competitor| competitor['name'] == 'Nigel Hinton' }
    assert_equal '1', hinton['assignedNumber']
    assert_nil hinton['suit']
  end

  test '#show hides drafts from guests' do
    @event.update_column(:status, :draft)

    get api_v1_speed_skydiving_competition_path(@event)
    assert_response :not_found

    get api_v1_speed_skydiving_competition_path(@event), headers: bearer(:event_responsible_write)
    assert_response :success
  end

  test '#create creates an event owned by the current user' do
    assert_difference -> { SpeedSkydivingCompetition.count } => 1 do
      post api_v1_speed_skydiving_competitions_path,
           params: { event: { name: 'Speed Cup', starts_at: '2026-08-01', place_id: places(:puschino).id,
                              use_teams: true } },
           headers: bearer(:regular_user_write), as: :json
    end

    assert_response :created
    event = SpeedSkydivingCompetition.last
    assert_equal users(:regular_user), event.responsible
    assert_equal event.id, response.parsed_body['id']
    assert response.parsed_body['useTeams']
  end

  test '#create requires authentication' do
    post api_v1_speed_skydiving_competitions_path, params: { event: { name: 'Speed Cup' } }, as: :json

    assert_response :unauthorized
  end

  test '#create reports validation errors' do
    post api_v1_speed_skydiving_competitions_path,
         params: { event: { name: 'Speed Cup' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update changes the event and the detail' do
    get api_v1_speed_skydiving_competition_path(@event)
    etag = response.headers['ETag']

    patch api_v1_speed_skydiving_competition_path(@event),
          params: { event: { name: 'Renamed', status: 'finished' } },
          headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal 'Renamed', response.parsed_body['name']
    assert_predicate @event.reload, :finished?

    get api_v1_speed_skydiving_competition_path(@event), headers: { 'If-None-Match' => etag }
    assert_response :success
  end

  test '#update is forbidden for non-editors' do
    patch api_v1_speed_skydiving_competition_path(@event),
          params: { event: { name: 'Renamed' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
    assert_equal 'Russian Nationals', @event.reload.name
  end
end
