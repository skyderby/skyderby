require 'test_helper'

class Api::V1::Tournaments::RoundsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @tournament = tournaments(:world_base_race) }

  test '#create adds a round and changes the bracket' do
    get api_v1_tournament_bracket_path(@tournament)
    etag = response.headers['ETag']

    post api_v1_tournament_rounds_path(@tournament), headers: bearer(:regular_user_write)

    assert_response :created
    assert_equal 2, response.parsed_body['order']

    get api_v1_tournament_bracket_path(@tournament), headers: { 'If-None-Match' => etag }
    assert_response :success
    assert_equal 2, response.parsed_body['rounds'].size
  end

  test '#destroy refuses to delete a round with matches' do
    delete api_v1_tournament_round_path(@tournament, tournament_rounds(:round_1)), headers: bearer(:regular_user_write)

    assert_response :unprocessable_content
  end

  test '#destroy deletes an empty round' do
    round = @tournament.rounds.create!

    delete api_v1_tournament_round_path(@tournament, round), headers: bearer(:regular_user_write)

    assert_response :no_content
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_rounds_path(@tournament), headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end
end
