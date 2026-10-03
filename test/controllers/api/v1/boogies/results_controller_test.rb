require 'test_helper'

class Api::V1::Boogies::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @competitor = Boogie::Competitor.find(ActiveRecord::FixtureSet.identify(:boogie_alex))
    @round = Boogie::Round.find(ActiveRecord::FixtureSet.identify(:boogie_distance_1))
    @result = Boogie::Result.find(ActiveRecord::FixtureSet.identify(:boogie_john_1))
  end

  test '#create uploads a track file' do
    assert_difference -> { Track.count } => 1, -> { @round.results.count } => 1 do
      post api_v1_boogie_results_path(@boogie),
           params: { result: { competitor_id: @competitor.id, round_id: @round.id, track_id: tracks(:hellesylt).id,
                               file: fixture_file_upload('tracks/flysight.csv', 'text/csv') } },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    body = response.parsed_body
    assert_equal @competitor.id, body['competitorId']
    assert_not_equal tracks(:hellesylt).id, body['trackId']
  end

  test '#create uses an existing track when chosen' do
    assert_no_difference -> { Track.count } do
      post api_v1_boogie_results_path(@boogie),
           params: { result: { competitor_id: @competitor.id, round_id: @round.id, track_id: tracks(:hellesylt).id,
                               track_from: 'existing_track',
                               file: fixture_file_upload('tracks/flysight.csv', 'text/csv') } },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    assert_equal tracks(:hellesylt).id, response.parsed_body['trackId']
  end

  test '#create changes the scoreboard etag' do
    get api_v1_boogie_scoreboard_path(@boogie), headers: bearer(:event_responsible_write)
    etag = response.headers['ETag']

    post api_v1_boogie_results_path(@boogie),
         params: { result: { competitor_id: @competitor.id, round_id: @round.id, track_id: tracks(:hellesylt).id } },
         headers: bearer(:event_responsible_write), as: :json
    get api_v1_boogie_scoreboard_path(@boogie), headers: bearer(:event_responsible_write).merge('If-None-Match' => etag)

    assert_response :success
  end

  test '#create rejects an inaccessible track' do
    tracks(:hellesylt).update_column(:visibility, Track.visibilities[:private_track])

    post api_v1_boogie_results_path(@boogie),
         params: { result: { competitor_id: @competitor.id, round_id: @round.id, track_id: tracks(:hellesylt).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :not_found
  end

  test '#create accepts a private track of the competitor' do
    track = tracks(:boogie_track_1)
    track.update_columns(visibility: Track.visibilities[:private_track], profile_id: @competitor.profile_id)

    post api_v1_boogie_results_path(@boogie),
         params: { result: { competitor_id: @competitor.id, round_id: @round.id, track_id: track.id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :created
  end

  test '#create rejects a round of another event' do
    post api_v1_boogie_results_path(@boogie),
         params: { result: { competitor_id: @competitor.id, round_id: event_rounds(:distance_1).id,
                             track_id: tracks(:hellesylt).id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :not_found
  end

  test '#create returns validation errors without a track' do
    post api_v1_boogie_results_path(@boogie),
         params: { result: { competitor_id: @competitor.id, round_id: @round.id } },
         headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
    assert_not_empty response.parsed_body['errors']
  end

  test '#update replaces the track' do
    patch api_v1_boogie_result_path(@boogie, @result), params: { result: { track_id: tracks(:hellesylt).id } },
                                                       headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_equal tracks(:hellesylt).id, @result.reload.track_id
  end

  test '#destroy removes the result' do
    delete api_v1_boogie_result_path(@boogie, @result), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not Boogie::Result.exists?(@result.id)
  end

  test '#destroy is forbidden for non editors' do
    delete api_v1_boogie_result_path(@boogie, @result), headers: bearer(:regular_user_write)

    assert_response :forbidden
    assert Boogie::Result.exists?(@result.id)
  end
end
