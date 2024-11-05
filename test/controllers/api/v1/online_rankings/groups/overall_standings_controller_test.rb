require 'test_helper'

class Api::Web::OnlineRankings::Groups::OverallStandingsControllerTest < ActionDispatch::IntegrationTest
  test '#show - returns the overall standings for the group' do
    group = virtual_competition_groups(:cumulative)
    create_result(virtual_competitions(:skydive_distance_wingsuit), profiles(:maynard), suits(:apache), 3900)
    create_result(virtual_competitions(:skydive_distance_tracksuit), profiles(:maynard), suits(:oneshot), 2700)

    get api_v1_group_overall_standings_url(group)

    assert_response :success
    standings = response.parsed_body['data']
    assert_equal %w[tracksuit wingsuit], standings.pluck('category').sort
    wingsuit_standings = standings.find { _1['category'] == 'wingsuit' }
    assert_equal 1, wingsuit_standings['rows'].size
    wingsuit_first_place = wingsuit_standings['rows'].find { _1['rank'] == 1 }
    assert_equal profiles(:maynard).id, wingsuit_first_place['profileId']
    expected_result = {
      distance: {
        rank: 1,
        result: 3900,
        points: 100,
        suitId: suits(:apache).id,
        trackId: Track.where(pilot: profiles(:maynard), suit: suits(:apache)).first.id
      }
    }.deep_stringify_keys
    assert_equal expected_result, wingsuit_first_place['results']
  end

  def create_result(virtual_competition, pilot, suit, result)
    Track.create!(kind: :skydive, pilot:, suit:).then do |track|
      track.virtual_competition_results.create!(wind_cancelled: true, virtual_competition:, result:)
      track.virtual_competition_results.create!(wind_cancelled: false, virtual_competition:, result:)
    end
  end
end
