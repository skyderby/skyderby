require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::TrackUploadsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @round = speed_skydiving_competition_rounds(:nationals_round_2)
    @hinton = speed_skydiving_competition_competitors(:hinton)
  end

  test '#create uploads a track to the matched competitor' do
    assert_difference -> { @event.results.where(round: @round).count } => 1 do
      post api_v1_speed_skydiving_competition_track_upload_path(@event),
           params: { round_id: @round.id, assigned_number: @hinton.assigned_number,
                     file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    result = response.parsed_body['results'].sole
    assert_equal @hinton.id, result['competitorId']
    assert_not_nil result['trackId']
  end

  test '#create reports an unknown number' do
    post api_v1_speed_skydiving_competition_track_upload_path(@event),
         params: { round_id: @round.id, assigned_number: '999',
                   file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
    assert_equal ['No competitor with number 999'], response.parsed_body['errors']
  end

  test '#create is forbidden for non-editors' do
    post api_v1_speed_skydiving_competition_track_upload_path(@event),
         params: { round_id: @round.id, assigned_number: @hinton.assigned_number,
                   file: fixture_file_upload('tracks/flysight.csv', 'text/csv') },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
