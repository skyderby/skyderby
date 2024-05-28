require 'test_helper'

class Api::V1::Events::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = events(:nationals)
    @section_advanced = event_sections(:advanced)
    @section_intermediate = event_sections(:intermediate)
    @john = event_competitors(:john)
    @travis = event_competitors(:travis)
    @alex = event_competitors(:alex)
    @speed_round_1 = event_rounds(:speed_1)
    @distance_round_1 = event_rounds(:distance_1)
  end

  test '#show, format: :json' do
    get api_v1_event_scoreboard_url(event_id: @event.id)

    assert_response :success
    response_json = JSON.parse(response.body)
    expected_json = JSON.parse(expected_result.to_json)

    assert_equal expected_json, response_json
  end

  def expected_result
    {
      sections: [{
        id: @section_advanced.id,
        name: 'Advanced',
        order: @section_advanced.order
      }, {
        id: @section_intermediate.id,
        name: 'Intermediate',
        order: @section_intermediate.order
      }],
      rounds: [
        { id: @distance_round_1.id, discipline: 'distance', number: 1 },
        { id: @speed_round_1.id, discipline: 'speed', number: 1 }
      ],
      teams: [],
      competitors: [{
        id: @travis.id,
        name: 'Travis',
        sectionId: @section_advanced.id,
        countryCode: 'NOR',
        suitName: 'TS Apache Series',
        teamId: nil,
        totalPoints: 183.3,
        results: [{
          discipline: 'distance',
          round: 1,
          result: '2500',
          points: '83.3'
        }, {
          discipline: 'speed',
          round: 1,
          result: '270.0',
          points: '100.0'
        }]
      }, {
        id: @john.id,
        name: 'John',
        sectionId: @section_advanced.id,
        countryCode: 'NOR',
        suitName: 'TS Apache Series',
        teamId: nil,
        totalPoints: 174.1,
        results: [{
          discipline: 'distance',
          round: 1,
          result: '3000',
          points: '100.0'
        }, {
          discipline: 'speed',
          round: 1,
          result: '200.0',
          points: '74.1'
        }]
      }, {
        id: @alex.id,
        name: 'Alex',
        sectionId: @section_advanced.id,
        countryCode: nil,
        suitName: 'TS Nala',
        teamId: nil,
        totalPoints: 0.0,
        results: []
      }]
    }
  end
end
