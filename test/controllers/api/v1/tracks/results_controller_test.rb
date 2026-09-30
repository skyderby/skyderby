require 'test_helper'

class Api::V1::Tracks::ResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @track = tracks(:hellesylt)
  end

  test '#show explains why a track has no online results' do
    get api_v1_track_results_path(@track)

    assert_response :success
    body = response.parsed_body
    assert_empty body['onlineResults']
    assert_equal 'no_suit', body['onlineEmptyReason']
    assert_equal 'performance_competition', body.dig('eventResult', 'eventKind')
    assert body.dig('eventResult', 'disciplineLabel')
  end

  test '#show reports private tracks as not scored' do
    @track.update!(visibility: :unlisted_track, suit: suits(:apache))

    get api_v1_track_results_path(@track), headers: bearer(:regular_user_read)

    assert_equal 'not_public', response.parsed_body['onlineEmptyReason']
  end

  test '#show lists online results with ranking context' do
    competition = virtual_competitions(:skydive_distance_wingsuit)
    VirtualCompetition::Result.create!(track: @track, virtual_competition: competition, result: 2500)

    get api_v1_track_results_path(@track), headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    result = body['onlineResults'].first
    assert_equal competition.id, result['competitionId']
    assert_equal 2500, result['result']
    assert result['valid']
    assert_equal 1, result['ownTotal']
    assert_nil body['onlineEmptyReason']
    assert body['viewerIsPilot']
  end

  test '#show returns 404 for private track of someone else' do
    @track.private_track!

    get api_v1_track_results_path(@track), headers: bearer(:event_responsible_write)

    assert_response :not_found
  end
end
