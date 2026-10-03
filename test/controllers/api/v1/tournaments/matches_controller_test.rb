require 'test_helper'

class Api::V1::Tournaments::MatchesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @tournament = tournaments(:world_base_race)
    @match = tournament_matches(:match_1)
    @slot = tournament_match_slots(:slot_1)
  end

  test '#update changes the match and its slots' do
    params = {
      match: {
        start_time: '2015-07-02T11:45:38.185Z',
        match_type: 'gold_finals',
        slots: [{ id: @slot.id, is_winner: true, earn_medal: 'gold', notes: 'Clean' }]
      }
    }

    patch api_v1_tournament_match_path(@tournament, @match), params:, headers: bearer(:regular_user_write), as: :json

    assert_response :success
    body = response.parsed_body
    assert_equal '2015-07-02T11:45:38.185Z', body['startTime']
    assert_equal 'gold_finals', body['matchType']
    slot = body['slots'].sole
    assert slot['isWinner']
    assert_equal 'gold', slot['earnMedal']
    assert_equal 'Clean', @slot.reload.notes
  end

  test '#update assigns a tournament competitor to a slot' do
    competitor = @tournament.competitors.create!(profile: profiles(:alex), suit: suits(:apache))

    patch api_v1_tournament_match_path(@tournament, @match),
          params: { match: { slots: [{ id: @slot.id, competitor_id: competitor.id }] } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :success
    assert_equal competitor, @slot.reload.competitor
  end

  test '#update rejects a competitor from another tournament' do
    patch api_v1_tournament_match_path(@tournament, @match),
          params: {
            match: { slots: [{ id: @slot.id, competitor_id: tournament_competitors(:qualification_competitor).id }] }
          },
          headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
    assert_equal tournament_competitors(:race_competitor), @slot.reload.competitor
  end

  test '#update rejects a slot from another match' do
    other_match = tournament_rounds(:round_1).matches.create!

    patch api_v1_tournament_match_path(@tournament, @match),
          params: { match: { slots: [{ id: other_match.slots.first.id, notes: 'x' }] } },
          headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#update rejects an unknown match type' do
    patch api_v1_tournament_match_path(@tournament, @match),
          params: { match: { match_type: 'semi' } }, headers: bearer(:regular_user_write), as: :json

    assert_response :unprocessable_content
  end

  test '#destroy deletes the match with its slots' do
    delete api_v1_tournament_match_path(@tournament, @match), headers: bearer(:regular_user_write)

    assert_response :no_content
    assert_not Tournament::Match::Slot.exists?(@slot.id)
  end

  test '#update is forbidden for non organizers' do
    patch api_v1_tournament_match_path(@tournament, @match),
          params: { match: { match_type: 'gold_finals' } }, headers: bearer(:event_responsible_write), as: :json

    assert_response :forbidden
  end
end
