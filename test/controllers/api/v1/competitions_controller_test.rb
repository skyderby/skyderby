require 'test_helper'

class Api::V1::CompetitionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#index lists every competition type with pagination' do
    get api_v1_competitions_path

    assert_response :success
    body = response.parsed_body
    types = body['items'].pluck('type')
    assert_includes types, 'performance_competition'
    assert_includes types, 'boogie'
    assert_includes types, 'speed_skydiving_competition'
    assert_includes types, 'tournament'
    assert_equal 1, body['page']
    assert_equal 20, body['perPage']

    nationals = body['items'].find { |item| item['type'] == 'performance_competition' }
    assert_equal events(:nationals).id, nationals['id']
    assert_equal 'published', nationals['status']
    assert_equal({ 'from' => 3000, 'to' => 2000 }, nationals['window'])
    assert_equal 'DZ Ravenna', nationals.dig('place', 'name')
    assert_includes nationals['competitorsCount'], { 'name' => 'Advanced', 'count' => 3 }
    assert_equal "/api/v1/performance_competitions/#{events(:nationals).id}", nationals['path']
  end

  test '#index hides drafts from guests but shows them to the responsible' do
    events(:nationals).update_column(:status, :draft)

    get api_v1_competitions_path
    assert_not_includes performance_ids, events(:nationals).id

    get api_v1_competitions_path, headers: bearer(:event_responsible_write)
    assert_includes performance_ids, events(:nationals).id
  end

  test '#index filters by kind and paginates' do
    get api_v1_competitions_path(kind: 'speed_skydiving', per: 1)

    body = response.parsed_body
    assert_equal ['speed_skydiving_competition'], body['items'].pluck('type').uniq
    assert_equal 1, body['items'].size
    assert_equal 1, body['perPage']
  end

  private

  def performance_ids
    response.parsed_body['items'].select { |item| item['type'] == 'performance_competition' }.pluck('id')
  end
end
