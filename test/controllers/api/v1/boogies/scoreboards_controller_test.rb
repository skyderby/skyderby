require 'test_helper'

class Api::V1::Boogies::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
  end

  test '#show averages the best results of qualified competitors' do
    get api_v1_boogie_scoreboard_path(@boogie)

    assert_response :success
    group = response.parsed_body['groups'].sole
    assert_equal ActiveRecord::FixtureSet.identify(:boogie_john_2), group['bestResultId']

    rows = group['rows']
    assert_equal [1, 2, 3], rows.first(3).pluck('rank')
    assert_equal [3100.0, 2550.0], rows.first(2).pluck('totalPoints')
    assert_equal [true, true, false], rows.first(3).pluck('qualified')
    assert_equal '3100', rows.first['formattedTotalPoints']
    assert_equal 2, rows.first['results'].size
  end

  test '#show hides standings of a surprise boogie' do
    @boogie.update_column(:status, :surprise)

    get api_v1_boogie_scoreboard_path(@boogie)

    assert response.parsed_body['surprise']
    assert_empty response.parsed_body['groups']
  end
end
