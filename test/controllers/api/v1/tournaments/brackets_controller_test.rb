require 'test_helper'

class Api::V1::Tournaments::BracketsControllerTest < ActionDispatch::IntegrationTest
  test '#show returns rounds, matches and slots' do
    tournament_match_slots(:slot_1).update_columns(result: 25.123, is_winner: true)

    get api_v1_tournament_bracket_path(tournaments(:world_base_race))

    assert_response :success
    round = response.parsed_body['rounds'].sole
    assert_equal 'finals', round['stage']
    assert_equal 'Finals', round['stageLabel']
    assert_equal 'none', round['connector']
    match = round['matches'].sole
    assert_equal 'Heat 1', match['label']
    assert_equal 1, match['freeSlots']
    slot = match['slots'].sole
    assert_equal 'John', slot.dig('competitor', 'name')
    assert_in_delta 25.123, slot['result']
    assert_equal '25.123', slot['formattedResult']
    assert slot['isWinner']
  end

  test '#show hides a surprise bracket' do
    tournaments(:world_base_race).update_column(:status, :surprise)

    get api_v1_tournament_bracket_path(tournaments(:world_base_race))

    assert response.parsed_body['surprise']
    assert_empty response.parsed_body['rounds']
  end
end
