require 'test_helper'

class Api::V1::Events::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    get api_v1_event_competitors_path(events(:nationals))

    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal JSON.parse(expected_response.to_json), response_json
  end

  def expected_response
    [
      {
        id: event_competitors(:alex).id,
        name: 'Alex',
        suitId: suits(:nala).id,
        suitName: 'Nala',
        categoryId: event_sections(:advanced).id,
        categoryName: 'Advanced'
      }, {
        id: event_competitors(:john).id,
        name: 'John',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:advanced).id,
        categoryName: 'Advanced'
      }, {
        id: event_competitors(:travis).id,
        name: 'Travis',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:advanced).id,
        categoryName: 'Advanced'
      }
    ]
  end
end
