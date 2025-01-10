require 'test_helper'

class Api::V1::Events::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    get api_v1_event_competitors_path(event_id: events(:nationals).id), as: :json
    assert_response :success

    assert_equal expected_response.to_json, response.body
  end

  private

  def expected_response
    [
      {
        id: event_competitors(:alex).id,
        name: 'Alex',
        suit_id: suits(:nala).id,
        suit_name: 'Nala',
        category_id: event_sections(:advanced).id,
        category_name: 'Advanced'
      },
      {
        id: event_competitors(:john).id,
        name: 'John',
        suit_id: suits(:apache).id,
        suit_name: 'Apache Series',
        category_id: event_sections(:advanced).id,
        category_name: 'Advanced'
      }, {
        id: event_competitors(:travis).id,
        name: 'Travis',
        suit_id: suits(:apache).id,
        suit_name: 'Apache Series',
        category_id: event_sections(:advanced).id,
        category_name: 'Advanced'
      }
    ]
  end
end
