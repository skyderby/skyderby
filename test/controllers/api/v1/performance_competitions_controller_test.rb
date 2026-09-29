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
end
