require 'test_helper'

class Api::V1::PerformanceCompetitions::TrackUploadsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @round = @event.rounds.create!(discipline: :time)
    @john = event_competitors(:john)
    @john.update!(assigned_number: '5')
  end

  test '#create uploads a track to every competitor sharing the number' do
    twin = @event.competitors.create!(
      category: event_sections(:advanced), suit: suits(:apache), profile: profiles(:maynard), assigned_number: '5'
    )

    assert_difference -> { Track.count } => 1, -> { @round.results.count } => 2 do
      post api_v1_performance_competition_track_upload_path(@event),
           params: { round_id: @round.id, assigned_number: '5',
                     file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    results = response.parsed_body['results']
    assert_equal [@john.id, twin.id].sort, results.pluck('competitorId').sort
    assert_equal 1, results.pluck('trackId').uniq.size
  end

  test '#create reports an unknown number' do
    post api_v1_performance_competition_track_upload_path(@event),
         params: { round_id: @round.id, assigned_number: '999',
                   file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_track_upload_path(@event),
         params: { round_id: @round.id, assigned_number: '5',
                   file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
