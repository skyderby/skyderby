require 'test_helper'

class Api::V1::Tournaments::Rounds::MatchesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @tournament = tournaments(:world_base_race) }

  test '#create adds a match with empty slots' do
    post api_v1_tournament_round_matches_path(@tournament, tournament_rounds(:round_1)),
         headers: bearer(:regular_user_write)

    assert_response :created
    body = response.parsed_body
    assert_equal tournament_rounds(:round_1).id, body['roundId']
    assert_equal 2, body['slots'].size
  end

  test '#create is forbidden for non organizers' do
    post api_v1_tournament_round_matches_path(@tournament, tournament_rounds(:round_1)),
         headers: bearer(:event_responsible_write)

    assert_response :forbidden
  end
end
