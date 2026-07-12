require 'test_helper'

class PerformanceCompetitions::TrackUploadsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
    @round = @event.rounds.create!(discipline: :time)
    @john = event_competitors(:john)
    @john.update!(assigned_number: '5')
  end

  test '#new renders the upload modal for the responsible user' do
    sign_in users(:event_responsible)

    get new_performance_competition_track_upload_path(@event), as: :turbo_stream

    assert_response :success
    assert_match 'track-upload', response.body
    assert_match @john.name, response.body
  end

  test '#new is forbidden for anonymous user' do
    get new_performance_competition_track_upload_path(@event)

    assert_response :forbidden
  end

  test '#create uploads a track to the matched competitor' do
    sign_in users(:event_responsible)

    assert_difference -> { @event.results.where(round: @round).count } => 1 do
      post performance_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: @john.assigned_number,
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :success
    result = @event.results.where(round: @round).find_by(competitor: @john)
    assert_not_nil result
    assert_not_nil result.track
  end

  test '#create attaches the same track to every competitor sharing the number' do
    sign_in users(:event_responsible)

    twin = @event.competitors.create!(
      category: event_sections(:advanced),
      suit: suits(:apache),
      profile: profiles(:alex),
      assigned_number: @john.assigned_number
    )

    assert_difference -> { Track.count } => 1,
                      -> { @event.results.where(round: @round).count } => 2 do
      post performance_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: @john.assigned_number,
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :success

    john_result = @event.results.where(round: @round).find_by(competitor: @john)
    twin_result = @event.results.where(round: @round).find_by(competitor: twin)
    assert_equal john_result.track_id, twin_result.track_id
  end

  test '#create with unknown number reports an error and creates nothing' do
    sign_in users(:event_responsible)

    assert_no_difference -> { @event.results.where(round: @round).count } do
      post performance_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: '999',
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :unprocessable_content
  end
end
