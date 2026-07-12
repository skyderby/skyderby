require 'test_helper'

class SpeedSkydivingCompetitions::TrackUploadsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @round = speed_skydiving_competition_rounds(:nationals_round_2)
    @hinton = speed_skydiving_competition_competitors(:hinton)
  end

  test '#new renders the upload modal for the responsible user' do
    sign_in users(:event_responsible)

    get new_speed_skydiving_competition_track_upload_path(@event), as: :turbo_stream

    assert_response :success
    assert_match 'track-upload', response.body
    assert_match @hinton.name, response.body
  end

  test '#new is forbidden for anonymous user' do
    get new_speed_skydiving_competition_track_upload_path(@event)

    assert_response :forbidden
  end

  test '#create uploads a track to the matched competitor' do
    sign_in users(:event_responsible)

    assert_difference -> { @event.results.where(round: @round).count } => 1 do
      post speed_skydiving_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: @hinton.assigned_number,
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :success
    result = @event.results.where(round: @round).find_by(competitor: @hinton)
    assert_not_nil result
    assert_not_nil result.track
  end

  test '#create attaches the same track to every competitor sharing the number' do
    sign_in users(:event_responsible)

    twin = @event.competitors.create!(
      category: speed_skydiving_competition_categories(:male),
      profile: profiles(:alex),
      assigned_number: @hinton.assigned_number
    )

    assert_difference -> { Track.count } => 1,
                      -> { @event.results.where(round: @round).count } => 2 do
      post speed_skydiving_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: @hinton.assigned_number,
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :success

    hinton_result = @event.results.where(round: @round).find_by(competitor: @hinton)
    twin_result = @event.results.where(round: @round).find_by(competitor: twin)
    assert_equal hinton_result.track_id, twin_result.track_id
  end

  test '#create with unknown number reports an error and creates nothing' do
    sign_in users(:event_responsible)

    assert_no_difference -> { @event.results.where(round: @round).count } do
      post speed_skydiving_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: '999',
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :unprocessable_content
  end

  test '#create is rejected for a completed round' do
    sign_in users(:event_responsible)
    @round.update!(completed_at: Time.current)

    assert_no_difference -> { @event.results.where(round: @round).count } do
      post speed_skydiving_competition_track_upload_path(@event),
           params: {
             round_id: @round.id,
             assigned_number: @hinton.assigned_number,
             file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
           }
    end

    assert_response :unprocessable_content
  end
end
