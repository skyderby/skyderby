require 'test_helper'

class Api::V1::Tournaments::QualificationsControllerTest < ActionDispatch::IntegrationTest
  test '#show ranks qualification results' do
    qualification_jumps(:qualification_jump_1).update_columns(
      competitor_id: tournament_competitors(:qualification_competitor).id, result: 25.5, canopy_time: 35
    )

    get api_v1_tournament_qualification_path(tournaments(:qualification_loen))

    assert_response :success
    body = response.parsed_body
    assert_equal 'best_result', body['scoring']
    assert_equal ['Round 1'], body['rounds'].pluck('label')
    row = body['rows'].sole
    assert_equal 1, row['rank']
    assert_in_delta 25.5, row['bestResult']
    jump = row['results'].sole
    assert_equal '25.500', jump['formattedResult']
    assert jump['canopyLow']
  end

  test '#show returns not found without qualification' do
    get api_v1_tournament_qualification_path(tournaments(:world_base_race))

    assert_response :not_found
  end
end
