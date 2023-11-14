describe Api::V1::OnlineRankings::Groups::OverallStandingsController do
  render_views

  describe '#show' do
    it 'returns the overall standings for the group', :aggregate_failures do
      group = virtual_competition_groups(:cumulative)
      create_result(virtual_competitions(:skydive_distance_wingsuit), profiles(:maynard), suits(:apache), 3900)
      create_result(virtual_competitions(:skydive_distance_tracksuit), profiles(:maynard), suits(:oneshot), 2700)

      get :show, params: { group_id: group.id }, format: :json

      expect(response).to be_successful
      standings = response.parsed_body['standings']
      expect(standings.map { _1['category'] }).to contain_exactly('wingsuit', 'tracksuit')
      wingsuit_standings = standings.find { _1['category'] == 'wingsuit' }
      expect(wingsuit_standings['rows'].size).to eq(1)
      wingsuit_first_place = wingsuit_standings['rows'].find { _1['rank'] == 1 }
      expect(wingsuit_first_place['profileId']).to eq(profiles(:maynard).id)
      expect(wingsuit_first_place['results']).to eq({
        distance: {
          result: 3900,
          points: 100,
          suitId: suits(:apache).id
        }
      }.deep_stringify_keys)
    end

    def wingsuit_standings
      {
        category: 'wingsuit',
        rows: [
          {
            rank: 1,
            profileId: profiles(:maynard).id,
            results: {
              distance: {
                result: 3900,
                points: 100
              }
            }
          }
        ]
      }.deep_stringify_keys
    end

    def tracksuit_standings
      {
        category: 'tracksuit',
        rows: [
          { rank: 1, profileId: profiles(:maynard).id }
        ]
      }.deep_stringify_keys
    end

    def create_result(virtual_competition, pilot, suit, result)
      Track.create!(kind: :skydive, pilot:, suit:).then do |track|
        track.virtual_competition_results.create!(wind_cancelled: true, virtual_competition:, result:)
        track.virtual_competition_results.create!(wind_cancelled: false, virtual_competition:, result:)
      end
    end
  end
end
