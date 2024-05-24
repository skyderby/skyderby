require 'test_helper'

class Api::V1::Events::CompetitorsControllerTest < ActionDispatch::IntegrationTest
  test '#index' do
    get api_v1_event_competitors_path(events(:published_public))

    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal JSON.parse(expected_response.to_json), response_json
  end

  def expected_response
    [
      {
        id: 1,
        name: 'John',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:speed_distance_time_advanced).id,
        categoryName: 'Advanced'
      }, {
        id: 2,
        name: 'Travis',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:speed_distance_time_advanced).id,
        categoryName: 'Advanced'
      }
    ]
  end
end
