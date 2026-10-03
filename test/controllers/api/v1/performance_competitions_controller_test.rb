require 'test_helper'

class Api::V1::PerformanceCompetitionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
  end

  test '#show returns event details, rounds and competitors' do
    get api_v1_performance_competition_path(@event)

    assert_response :success
    body = response.parsed_body
    assert_equal 'performance_competition', body['type']
    assert_equal 'WS Performance Nationals', body['name']
    assert_equal '2015-03-01', body['startsAt']
    assert_equal({ 'from' => 3000, 'to' => 2000 }, body['window'])
    assert_equal 'ITA', body.dig('place', 'countryCode')
    assert_not body['editable']
    assert_not body['surprise']
    assert_equal %w[Advanced Intermediate], body['categories'].pluck('name')
    assert_equal %w[distance speed], body['rounds'].pluck('discipline').sort
    assert(body['rounds'].all? { |round| round['completed'] })
    assert_equal %w[scoreboard open task task], body['boards'].pluck('key')

    john = body['competitors'].find { |competitor| competitor['id'] == event_competitors(:john).id }
    assert_equal 'John', john['name']
    assert_equal 'NOR', john['countryCode']
    assert_equal 'Apache Series', john.dig('suit', 'name')
    assert_equal event_sections(:advanced).id, john['categoryId']
  end

  test '#show hides drafts from guests and shows them to the responsible' do
    @event.update_column(:status, :draft)

    get api_v1_performance_competition_path(@event)
    assert_response :not_found

    get api_v1_performance_competition_path(@event), headers: bearer(:event_responsible_write)
    assert_response :success
    assert response.parsed_body['editable']
  end

  test '#show hides private events from non participants' do
    @event.update_column(:visibility, :private_event)

    get api_v1_performance_competition_path(@event), headers: bearer(:regular_user_read)
    assert_response :not_found

    get api_v1_performance_competition_path(@event), headers: bearer(:admin_write)
    assert_response :success
  end

  test '#show returns not modified for a matching etag' do
    get api_v1_performance_competition_path(@event)
    etag = response.headers['ETag']

    get api_v1_performance_competition_path(@event), headers: { 'If-None-Match' => etag }

    assert_response :not_modified
  end

  test '#show changes etag when a reference point changes' do
    get api_v1_performance_competition_path(@event)
    etag = response.headers['ETag']

    travel 1.minute do
      @event.reference_points.create!(name: 'Exit', latitude: 61.0, longitude: 7.0)
    end
    get api_v1_performance_competition_path(@event), headers: { 'If-None-Match' => etag }

    assert_response :success
  end

  test '#show exposes deletable and competitor country' do
    get api_v1_performance_competition_path(@event), headers: bearer(:event_responsible_write)

    body = response.parsed_body
    assert body['deletable']
    john = body['competitors'].find { |competitor| competitor['id'] == event_competitors(:john).id }
    assert_equal profiles(:john).country_id, john['countryId']
  end

  test '#create creates an event owned by the current user' do
    assert_difference -> { PerformanceCompetition.count } => 1 do
      post api_v1_performance_competitions_path,
           params: {
             event: {
               name: 'Spring Cup', starts_at: '2026-05-01', place_id: places(:ravenna).id,
               range_from: 3000, range_to: 2000, visibility: 'unlisted_event', designated_lane_start: 'on_10_sec'
             }
           },
           headers: bearer(:regular_user_write)
    end

    assert_response :created
    body = response.parsed_body
    assert_equal 'Spring Cup', body['name']
    assert_equal 'on_10_sec', body['designatedLaneStart']
    assert body['editable']
    assert_equal users(:regular_user), PerformanceCompetition.find(body['id']).responsible
  end

  test '#create requires write scope' do
    post api_v1_performance_competitions_path, params: { event: { name: 'Cup' } }, headers: bearer(:regular_user_read)

    assert_response :forbidden
  end

  test '#create requires authentication' do
    post api_v1_performance_competitions_path, params: { event: { name: 'Cup' } }

    assert_response :unauthorized
  end

  test '#create returns validation errors' do
    post api_v1_performance_competitions_path, params: { event: { name: '' } }, headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#create rejects unknown enum values' do
    post api_v1_performance_competitions_path,
         params: { event: { name: 'Cup', starts_at: '2026-05-01', visibility: 'bogus' } },
         headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#update changes event settings' do
    patch api_v1_performance_competition_path(@event),
          params: { event: { name: 'Renamed', wind_cancellation: true, use_teams: true, status: 'finished' } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    body = response.parsed_body
    assert_equal 'Renamed', body['name']
    assert body['windCancellation']
    assert body['useTeams']
    assert_equal 'finished', body['status']
  end

  test '#update is forbidden for non editors' do
    patch api_v1_performance_competition_path(@event),
          params: { event: { name: 'Renamed' } },
          headers: bearer(:regular_user_write)

    assert_response :forbidden
    assert_equal 'WS Performance Nationals', @event.reload.name
  end

  test '#update returns validation errors' do
    patch api_v1_performance_competition_path(@event),
          params: { event: { name: '' } },
          headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end
end
