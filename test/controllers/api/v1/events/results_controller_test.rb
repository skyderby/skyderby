require 'test_helper'

class Api::V1::Events::ResultsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:published_public)
    @user = users(:event_responsible)
  end

  test '#create - when not allowed' do
    post api_v1_event_results_path(event_id: @event.id)

    assert_response :forbidden
  end

  test '#create - when allowed, with correct data' do
    sign_in @user

    round = @event.rounds.create!(discipline: :distance)
    competitor = event_competitors(:competitor_1)

    @event.reference_points.create!(name: 'Lane 1', latitude: 20, longitude: 20)

    params = {
      competitor_name: competitor.name,
      round_name: 'Distance-2',
      penalized: 'true',
      penalty_size: 10,
      'reference_point[name]': 'Lane 1',
      'reference_point[latitude]': '40.0',
      'reference_point[longitude]': '40.0',
      'jump_range[exit_time]': '2018-02-24T15:23:44.40Z',
      'jump_range[deploy_time]': '2018-02-24T15:26:24.40Z',
      track_file: fixture_file_upload('tracks/distance_2454.csv')
    }

    post api_v1_event_results_path(event_id: @event.id), params: params

    assert_response :success

    response_json = JSON.parse(response.body)

    result = @event.results.last
    expect(response_json['id']).to eq(result.id)
    expect(result.penalized).to be_truthy

    track = result.track
    expect(track.ff_start).to eq(2405)
    expect(track.ff_end).to eq(2565)

    expect(round.reference_point_assignments.where(competitor: competitor)).not_to be_blank
    expect(@event.reference_points.count).to eq(2)
  end
end
