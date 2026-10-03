require 'test_helper'

class Api::V1::Tournaments::QualificationRoundsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @tournament = tournaments(:qualification_loen) }

  test '#create adds a round and changes the qualification board' do
    get api_v1_tournament_qualification_path(@tournament)
    etag = response.headers['ETag']

    post api_v1_tournament_qualification_rounds_path(@tournament), headers: bearer(:regular_user_write)

    assert_response :created
    assert_equal 2, response.parsed_body['order']
    assert_same false, response.parsed_body['completed']

    get api_v1_tournament_qualification_path(@tournament), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert_equal 2, response.parsed_body['rounds'].size
  end

  test '#update completes a round' do
    round = qualification_round(:qualification_1)

    patch api_v1_tournament_qualification_round_path(@tournament, round),
          params: { round: { completed: true } }, headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert response.parsed_body['completed']
    assert round.reload.completed
  end

  test '#destroy refuses to delete a round with results' do
    delete api_v1_tournament_qualification_round_path(@tournament, qualification_round(:qualification_1)),
           headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#destroy deletes an empty round' do
    round = @tournament.qualification_rounds.create!

    delete api_v1_tournament_qualification_round_path(@tournament, round), headers: bearer(:regular_user_write)

    assert_response :no_content
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_qualification_rounds_path(@tournament), headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end
end
