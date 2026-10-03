require 'test_helper'

class Api::V1::SpeedSkydivingCompetitions::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = speed_skydiving_competitions(:nationals)
    @result = speed_skydiving_competition_results(:hinton_round_1)
    @hinton = speed_skydiving_competition_competitors(:hinton)
    @maynard = speed_skydiving_competition_competitors(:maynard)
  end

  test '#show is hidden until the round is completed' do
    get api_v1_speed_skydiving_competition_result_path(@event, @result)
    assert_response :not_found

    get api_v1_speed_skydiving_competition_result_path(@event, @result), headers: bearer(:event_responsible_write)
    assert_response :success
  end

  test '#show returns result details' do
    speed_skydiving_competition_rounds(:nationals_round_1).update_column(:completed_at, Time.zone.now)

    get api_v1_speed_skydiving_competition_result_path(@event, @result)

    assert_response :success
    body = response.parsed_body
    assert_equal 1, body['roundNumber']
    assert_in_delta 350.0, body['finalResult']
    assert_equal 'Nigel Hinton', body.dig('competitor', 'name')
    assert_equal 'Male', body.dig('category', 'name')
  end

  test '#create uploads a track file and shows the result on the scoreboard' do
    round = speed_skydiving_competition_rounds(:nationals_round_2)
    get api_v1_speed_skydiving_competition_scoreboard_path(@event), headers: bearer(:event_responsible_write)
    etag = response.headers['ETag']

    assert_difference -> { @event.results.count } => 1 do
      post api_v1_speed_skydiving_competition_results_path(@event),
           params: { result: { competitor_id: @hinton.id, round_id: round.id,
                               file: fixture_file_upload('tracks/flysight.csv', 'text/csv') } },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    assert_equal round.id, response.parsed_body['roundId']
    assert_not_nil response.parsed_body['trackId']

    get api_v1_speed_skydiving_competition_scoreboard_path(@event),
        headers: bearer(:event_responsible_write).merge('If-None-Match' => etag)
    assert_response :success
  end

  test '#create attaches an accessible existing track' do
    round = speed_skydiving_competition_rounds(:nationals_round_2)
    uploaded = @event.upload_track(round:, competitors: [@hinton],
                                   file: fixture_file_upload('tracks/flysight.csv', 'text/csv')).sole

    post api_v1_speed_skydiving_competition_results_path(@event),
         params: { result: { competitor_id: @maynard.id, round_id: round.id, track_id: uploaded.track_id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
    assert_equal uploaded.track_id, response.parsed_body['trackId']
  end

  test '#create refuses a private track of someone else' do
    track = tracks(:hellesylt)
    track.update_column(:visibility, Track.visibilities[:private_track])

    assert_no_difference -> { @event.results.count } do
      post api_v1_speed_skydiving_competition_results_path(@event),
           params: { result: { competitor_id: @maynard.id, round_id: @result.round_id, track_id: track.id } },
           headers: bearer(:event_responsible_write), as: :json
    end

    assert_response :forbidden
  end

  test '#create reports a duplicate result' do
    post api_v1_speed_skydiving_competition_results_path(@event),
         params: { result: { competitor_id: @hinton.id, round_id: @result.round_id,
                             track_id: tracks(:speed_skydiving_track).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#destroy removes a result' do
    delete api_v1_speed_skydiving_competition_result_path(@event, @result), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not SpeedSkydivingCompetition::Result.exists?(@result.id)
  end

  test '#destroy is forbidden for non-editors' do
    delete api_v1_speed_skydiving_competition_result_path(@event, @result), headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
