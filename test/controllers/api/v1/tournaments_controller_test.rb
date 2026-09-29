require 'test_helper'

class Api::V1::TournamentsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show returns tournament details' do
    get api_v1_tournament_path(tournaments(:world_base_race))

    assert_response :success
    body = response.parsed_body
    assert_equal 'tournament', body['type']
    assert_equal 'WBR', body['name']
    assert_equal 'published', body['status']
    assert_equal 2, body['bracketSize']
    assert_equal ['bracket'], body['boards'].pluck('key')
    assert_equal 'legacy', body.dig('finishLine', 'name')
    assert_in_delta 62.0573629049, body.dig('finishLine', 'start', 'latitude')
    assert_equal ['John'], body['competitors'].pluck('name')
    assert_not body['competitors'].first['isDisqualified']
  end

  test '#show hides private tournaments from non participants' do
    tournaments(:world_base_race).update_column(:visibility, :private_event)

    get api_v1_tournament_path(tournaments(:world_base_race)), headers: bearer(:event_responsible_write)
    assert_response :not_found

    get api_v1_tournament_path(tournaments(:world_base_race)), headers: bearer(:regular_user_read)
    assert_response :success
  end
end
