require 'test_helper'

class Api::V1::PerformanceCompetitions::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @event = events(:nationals)
    @result = event_results(:john_distance_1)
  end

  test '#show returns result details' do
    get api_v1_performance_competition_result_path(@event, @result)

    assert_response :success
    body = response.parsed_body
    assert_equal @result.id, body['id']
    assert_equal 'distance', body.dig('round', 'discipline')
    assert_equal 'John', body.dig('competitor', 'name')
    assert_equal 'Advanced', body.dig('category', 'name')
    assert_in_delta 3000.0, body['result']
    assert_in_delta 2900.0, body['resultNet']
    assert_equal tracks(:hellesylt).id, body['trackId']
    assert_equal "/api/v1/tracks/#{tracks(:hellesylt).id}/point_series", body['pointSeriesPath']
  end

  test '#show hides results of uncompleted rounds' do
    event_rounds(:distance_1).update_column(:completed_at, nil)

    get api_v1_performance_competition_result_path(@event, @result)

    assert_response :not_found
  end

  test '#create uploads a track file for a competitor' do
    round = @event.rounds.create!(discipline: :time)

    assert_difference -> { round.results.count } => 1, -> { Track.count } => 1 do
      post api_v1_performance_competition_results_path(@event),
           params: {
             result: {
               competitor_id: event_competitors(:alex).id, round_id: round.id,
               file: fixture_file_upload('tracks/flysight.csv', 'text/csv')
             }
           },
           headers: bearer(:event_responsible_write)
    end

    assert_response :created
    body = response.parsed_body
    assert_equal event_competitors(:alex).id, body['competitorId']
    assert_equal round.id, body['roundId']
    assert_not_nil body['trackId']
  end

  test '#create attaches an existing viewable track' do
    round = @event.rounds.create!(discipline: :time)

    post api_v1_performance_competition_results_path(@event),
         params: { result: { competitor_id: event_competitors(:alex).id, round_id: round.id,
                             track_id: tracks(:hellesylt).id } },
         headers: bearer(:event_responsible_write)

    assert_response :created
    assert_equal tracks(:hellesylt).id, response.parsed_body['trackId']
  end

  test '#create refuses a private track of another pilot' do
    round = @event.rounds.create!(discipline: :time)
    tracks(:hellesylt).update_column(:visibility, Track.visibilities[:private_track])

    post api_v1_performance_competition_results_path(@event),
         params: { result: { competitor_id: event_competitors(:alex).id, round_id: round.id,
                             track_id: tracks(:hellesylt).id } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create requires a track' do
    round = @event.rounds.create!(discipline: :time)

    post api_v1_performance_competition_results_path(@event),
         params: { result: { competitor_id: event_competitors(:alex).id, round_id: round.id } },
         headers: bearer(:event_responsible_write)

    assert_response :unprocessable_content
  end

  test '#create refuses a round of another event' do
    post api_v1_performance_competition_results_path(@event),
         params: {
           result: {
             competitor_id: event_competitors(:alex).id, round_id: event_rounds(:boogie_distance_1).id,
             track_id: tracks(:hellesylt).id
           }
         },
         headers: bearer(:event_responsible_write)

    assert_response :not_found
  end

  test '#create is forbidden for non editors' do
    post api_v1_performance_competition_results_path(@event),
         params: { result: { competitor_id: event_competitors(:alex).id, round_id: event_rounds(:distance_1).id } },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#update swaps the track' do
    patch api_v1_performance_competition_result_path(@event, @result),
          params: { result: { track_id: tracks(:track_with_video).id } },
          headers: bearer(:event_responsible_write)

    assert_response :success
    assert_equal tracks(:track_with_video).id, @result.reload.track_id
  end

  test '#destroy removes a result' do
    delete api_v1_performance_competition_result_path(@event, @result), headers: bearer(:event_responsible_write)

    assert_response :no_content
    assert_not PerformanceCompetition::Result.exists?(@result.id)
  end

  test '#destroy is forbidden for non editors' do
    delete api_v1_performance_competition_result_path(@event, @result), headers: bearer(:regular_user_write)

    assert_response :forbidden
  end
end
