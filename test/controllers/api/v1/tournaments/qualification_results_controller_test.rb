require 'test_helper'

class Api::V1::Tournaments::QualificationResultsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:qualification_loen)
    @round = qualification_round(:qualification_1)
    @competitor = tournament_competitors(:qualification_competitor)
  end

  test '#create uploads a track file' do
    params = {
      result: {
        qualification_round_id: @round.id,
        competitor_id: @competitor.id,
        file: fixture_file_upload('tracks/loen_jump_one_08-02-19.CSV', 'text/csv')
      }
    }

    assert_difference -> { Track.count } => 1, -> { QualificationJump.count } => 1 do
      post api_v1_tournament_qualification_results_path(@tournament), params:, headers: bearer(:regular_user_write)
    end

    assert_response :created
    body = response.parsed_body
    jump = QualificationJump.find(body['id'])
    assert_equal jump.track_id, body['trackId']
    assert_equal @tournament, jump.track.owner
    assert_not_nil body['detectedStartTime']
  end

  test '#create links an existing track' do
    post api_v1_tournament_qualification_results_path(@tournament),
         params: {
           result: { qualification_round_id: @round.id, competitor_id: @competitor.id, track_id: tracks(:hellesylt).id }
         },
         headers: bearer(:regular_user_write), as: :json

    assert_response :created
    assert_equal tracks(:hellesylt).id, response.parsed_body['trackId']
  end

  test '#create rejects a competitor from another tournament' do
    post api_v1_tournament_qualification_results_path(@tournament),
         params: {
           result: {
             qualification_round_id: @round.id,
             competitor_id: tournament_competitors(:race_competitor).id,
             track_id: tracks(:hellesylt).id
           }
         },
         headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#create requires a track' do
    post api_v1_tournament_qualification_results_path(@tournament),
         params: { result: { qualification_round_id: @round.id, competitor_id: @competitor.id } },
         headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#destroy deletes a result' do
    jump = qualification_jumps(:qualification_jump_1)

    delete api_v1_tournament_qualification_result_path(@tournament, jump), headers: bearer(:regular_user_write)

    assert_response :no_content
    assert_not QualificationJump.exists?(jump.id)
  end

  test '#destroy is forbidden for non organizers' do
    delete api_v1_tournament_qualification_result_path(@tournament, qualification_jumps(:qualification_jump_1)),
           headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end
end
