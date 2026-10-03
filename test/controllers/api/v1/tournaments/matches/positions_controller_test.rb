require 'test_helper'

class Api::V1::Tournaments::Matches::PositionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:world_base_race)
    @first = tournament_matches(:match_1)
    @first.update!(position: 1)
    @second = tournament_rounds(:round_1).matches.create!
  end

  test '#update moves a match up' do
    patch api_v1_tournament_match_position_path(@tournament, @second),
          params: { direction: 'up' }, headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal 1, response.parsed_body['position']
    assert_equal 2, @first.reload.position
  end

  test '#update rejects an unknown direction' do
    patch api_v1_tournament_match_position_path(@tournament, @second),
          params: { direction: 'left' }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#update is forbidden for non organizers' do
    patch api_v1_tournament_match_position_path(@tournament, @second),
          params: { direction: 'up' }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
