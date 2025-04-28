require 'test_helper'

class Api::V1::Events::ScoreboardsControllerTest < ActionDispatch::IntegrationTest
  test '#show, format: :json' do
    event = performance_competitions(:nationals)

    get api_v1_event_scoreboard_path(event_id: event.id), as: :json

    expected_json = JSON.parse(expected_result.to_json)

    assert_equal expected_json, response.parsed_body
  end

  private

  def expected_result
    {
      sections: [{
        id: section_advanced.id,
        name: 'Advanced',
        order: section_advanced.order
      }, {
        id: section_intermediate.id,
        name: 'Intermediate',
        order: section_intermediate.order
      }],
      rounds: [
        { id: event_rounds(:distance_1).id, discipline: 'distance', number: 1 },
        { id: event_rounds(:speed_1).id, discipline: 'speed', number: 1 }
      ],
      teams: [],
      competitors: [{
        id: event_competitors(:travis).id,
        name: 'Travis',
        section_id: section_advanced.id,
        country_code: 'NOR',
        suit_name: 'TS Apache Series',
        team_id: nil,
        total_points: 183.3,
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
        id: event_competitors(:john).id,
        name: 'John',
        section_id: section_advanced.id,
        country_code: 'NOR',
        suit_name: 'TS Apache Series',
        team_id: nil,
        total_points: 174.1,
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
        id: event_competitors(:alex).id,
        name: 'Alex',
        section_id: section_advanced.id,
        team_id: nil,
        country_code: nil,
        suit_name: 'TS Nala',
        total_points: 0.0,
        results: []
      }]
    }
  end

  def section_advanced
    @section_advanced ||= event_sections(:advanced)
  end

  def section_intermediate
    @section_intermediate ||= event_sections(:intermediate)
  end
end
